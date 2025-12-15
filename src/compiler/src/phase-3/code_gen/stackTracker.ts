import {
  ArrayType,
  Datatype,
  LongArrayType,
  LongType,
} from "../../phase-2/semantics/datatype";
import { AsmUtils } from "./asmUtils";
import { getSplitName, safeParseLong } from "../../phase-4/utils";
import { RegCache } from "./regCache";
import { LongReg, Reg } from "../RegTypes";

export class StackTracker {
  private regCache: RegCache;
  varToMemory: Map<string, string>; //memory mapping
  longVars: Set<String>;
  public curStackPtr = 0;
  private strLiteralMap: Map<string, Array<string>>;
  private globalVars: Map<string, Datatype>;
  private arrNames: Set<String>;
  private utils: AsmUtils;
  private maxMethodStackShift;
  private isMacOS: boolean;

  constructor() {
    this.varToMemory = new Map();
    this.longVars = new Set();
    this.strLiteralMap = new Map();
    this.globalVars = new Map();
    this.arrNames = new Set();
    this.utils = new AsmUtils();
    this.maxMethodStackShift = 0;
    // this.isMacOS = process.platform === "darwin";
    this.isMacOS = false; // Assume Linux/generic for web compilation
    this.regCache = new RegCache(this);
  }

  public removeRegCacheVar(varName: string): void {
    this.regCache.removeRegCacheVar(varName);
  }

  public addRegCacheVar(varName: string, reg: Reg): void {
    this.regCache.allocateRegister(varName, reg);
  }
  public getMaxStackPtr(): number {
    return this.maxMethodStackShift;
  }

  public flushCache(
    regesKilled: Set<LongReg>,
    liveVars: Set<string> | null
  ): string {
    return this.regCache.flushCache(regesKilled, liveVars);
  }

  public enableCache(): void {
    this.regCache.enableCache();
  }

  public restoreAllCacheVars(): string {
    return this.regCache.restoreAllRegVars();
  }
  public restoreSomeCacheVars(varsToRestore: Set<string>): string {
    return this.regCache.restoreRegVars(varsToRestore);
  }

  public clearScope(parent: StackTracker): void {
    const parentCopy = parent.duplicate();
    this.varToMemory = parentCopy.varToMemory;
    this.longVars = parentCopy.longVars;
    this.curStackPtr = parentCopy.curStackPtr;
    this.arrNames = parentCopy.arrNames;
    this.maxMethodStackShift = Math.max(
      this.maxMethodStackShift,
      parentCopy.maxMethodStackShift
    );
  }

  public clear() {
    this.varToMemory = new Map();
    this.longVars = new Set();
    this.curStackPtr = 0;
    this.maxMethodStackShift = 0;
    this.regCache.clear();

    this.globalVars.forEach((type, name) => {
      if (type instanceof LongType || type instanceof LongArrayType) {
        this.longVars.add(name);
      }
    });
  }

  public duplicate(): StackTracker {
    const newStack = new StackTracker();
    newStack.varToMemory = new Map(this.varToMemory);
    newStack.longVars = new Set(this.longVars);
    newStack.curStackPtr = this.curStackPtr;
    newStack.strLiteralMap = new Map();
    this.strLiteralMap.forEach((posibleNames, string) => {
      newStack.strLiteralMap.set(string, [...posibleNames]);
    });
    newStack.globalVars = new Map(this.globalVars);
    newStack.arrNames = new Set(this.arrNames);
    newStack.maxMethodStackShift = this.maxMethodStackShift;

    return newStack;
  }

  public addArrName(arrName: string, isLong: boolean) {
    this.arrNames.add(arrName);
    if (isLong) {
      this.longVars.add(arrName);
    }
  }

  public setGlobalDatatype(globarVar: string, type: Datatype) {
    this.globalVars.set(globarVar, type);
    if (type instanceof LongType || type instanceof LongArrayType) {
      this.longVars.add(globarVar);
    }
  }

  public getAnyMemLoc(
    varName: string,
    regIndex: number,
    isLong?: boolean
  ): { loadInstrs: string; memLocation: string } {
    let varLoads = "";
    if (this.regCache.areSpillsEnabled()) {
      varLoads = this.regCache.restoreRegVar(getSplitName(varName));
    }
    const cacheFetch = this.regCache.fetchVar(varName, isLong);
    if (cacheFetch !== null) {
      return {
        loadInstrs: varLoads,
        memLocation: cacheFetch,
      };
    }
    if (!isLong) {
      isLong = false;
    }
    const { arrayName, indexVar } =
      this.buildImplicitArrayLocationString(varName);
    if (arrayName === null || indexVar === null) {
      const storedMemLoc = this.fetchMemLocation(varName);
      if (storedMemLoc !== null) {
        return {
          loadInstrs: varLoads,
          memLocation: storedMemLoc,
        };
      }

      const { loadInstrs: globalVarLoad, memLocation: globalVarMem } =
        this.getGlobalVarMemLoc(varName, regIndex);

      if (globalVarLoad !== null && globalVarMem !== null) {
        return {
          loadInstrs: [varLoads, globalVarLoad].join("\n"),
          memLocation: globalVarMem,
        };
      }

      return {
        loadInstrs: varLoads,
        memLocation: this.getNewMemLocation(varName, isLong),
      };
    }

    const { loadInstrs: globalArrLoad, memLocation: globalArrMem } =
      this.getGlobalArrMemLoc(arrayName, indexVar, regIndex);
    if (globalArrLoad !== null && globalArrMem !== null) {
      return {
        loadInstrs: [varLoads, globalArrLoad].join("\n"),
        memLocation: globalArrMem,
      };
    }
    const arrStart = `${arrayName}[0]`;
    isLong = this.longVars.has(arrStart);
    const arrayStartLoc = this.getExplicitMemLocation(arrStart);
    const arrayStart = arrayStartLoc.split("(")[0];
    const regExtended = this.utils.getLongScratchReg(regIndex);
    const loadInstrs = this.buildArrayVarIndexOffsetInstruction(
      arrayStart,
      indexVar,
      regIndex,
      isLong
    );
    return {
      loadInstrs: [varLoads, loadInstrs].join("\n"),
      memLocation: `(${regExtended})`,
    };
  }

  private getExplicitMemLocation(varName: string): string {
    const memLoc = this.fetchMemLocation(varName);
    if (memLoc === null) {
      throw new Error("mem location is not stored!");
    }
    return memLoc;
  }

  public fetchMemLocation(varName: string): string | null {
    const numericConstant = this.handleConstants(varName);
    if (numericConstant !== null) {
      return numericConstant;
    }
    const cacheFetch = this.regCache.fetchVar(varName, undefined);
    if (cacheFetch !== null) {
      return cacheFetch;
    }
    if (this.varToMemory.has(varName))
      return this.varToMemory.get(varName) as string;
    return null;
  }

  private getNewMemLocation(varName: string, isLong: boolean): string {
    this.setMemLocation(varName, isLong);
    return this.getExplicitMemLocation(varName);
  }

  public setMemLocation(varName: string, isLong: boolean): void {
    const bytesInEntry = this.utils.calculateNextAddressOffset(
      this.curStackPtr,
      isLong
    );
    // const bytesInEntry = 8;

    const stackPtrOffest = bytesInEntry + this.curStackPtr;
    this.curStackPtr = stackPtrOffest;
    this.maxMethodStackShift = Math.max(
      this.maxMethodStackShift,
      stackPtrOffest
    );
    const memoryLocation = `${-stackPtrOffest}(%rbp)`;
    this.varToMemory.set(varName, memoryLocation);
    this.longVars.delete(varName); // if inner scope is replacing a long var for an int or bool
    if (isLong) this.longVars.add(varName);
  }

  public getstrLiteral(strLiteral: string): string | undefined {
    // return this.strLiteralMap.get(strLiteral)?.pop();
    if (this.strLiteralMap.has(strLiteral)) {
      const asmNames = this.strLiteralMap.get(strLiteral) as Array<string>;
      return asmNames[0];
    }
  }

  public handleConstants(posConstant: string): string | null {
    const longParse = this.utils.safeParseLong(posConstant);
    const intParse = this.utils.safeParseInt(posConstant);

    if (longParse !== null) {
      this.longVars.add(posConstant);
      return `$${longParse.toString()}`;
    }
    if (intParse !== null) {
      return `$${intParse.toString()}`;
    }
    return null;
  }

  private buildImplicitArrayLocationString(varName: string): {
    arrayName: string | null;
    indexVar: string | null;
  } {
    //checking we are in the var indexing memory location case
    if (this.varToMemory.has(varName))
      return { arrayName: null, indexVar: null };
    const splitName = varName.split(/\[|\]/);
    const emptyReturn = { arrayName: null, indexVar: null };
    if (splitName.length !== 3) return emptyReturn;
    const [arrName, index] = [...splitName];

    return { arrayName: arrName, indexVar: index };
  }

  private getGlobalVarMemLoc(
    varName: string,
    regIndex: number
  ): { loadInstrs: string | null; memLocation: string | null } {
    const blankReturn = { loadInstrs: null, memLocation: null };
    if (!this.globalVars.has(varName)) {
      return blankReturn;
    }
    const regUsed = this.utils.getLongScratchReg(regIndex);
    const varUsed = this.globalVars.get(varName);
    const destUsed =
      varUsed instanceof ArrayType ? `${regUsed}` : `(${regUsed})`;

    const loadEffectiveAddr = `lea ${varName}(%rip), ${regUsed}`;
    return { loadInstrs: loadEffectiveAddr, memLocation: `${destUsed}` };
  }

  private getGlobalArrMemLoc(
    varName: string,
    indexVar: string,
    regIndex: number
  ): { loadInstrs: string | null; memLocation: string | null } {
    const longCallerSaved = this.utils.getLongScratchReg(2);
    const blankReturn = { loadInstrs: null, memLocation: null };
    if (!this.globalVars.has(varName)) {
      return blankReturn;
    }
    const varUsed = this.globalVars.get(varName) as Datatype;
    if (!(varUsed instanceof ArrayType)) {
      return blankReturn;
    }
    const regUsed = this.utils.getLongScratchReg(regIndex);

    const loadEffectiveAddr = `lea ${varName}(%rip), ${longCallerSaved}`;
    // const arrayStartCalc = `subq %rbp, ${longCallerSaved}`;
    const safeIndexVar = indexVar as string;
    const startLoadComment = `# loading address of ${varName}[${indexVar}] into ${regUsed}`;
    const loadArrInstrs = this.buildArrayVarIndexOffsetInstruction(
      longCallerSaved,
      safeIndexVar,
      regIndex,
      this.longVars.has(varName)
    );
    const totalInstrs = [
      startLoadComment,
      loadEffectiveAddr,
      // arrayStartCalc,
      loadArrInstrs,
    ].join("\n");
    return { loadInstrs: totalInstrs, memLocation: `(${regUsed})` };
  }

  private buildArrayVarIndexOffsetInstruction(
    arrayStart: string,
    indexVar: string,
    regIndex: number,
    isLong: boolean
  ): string {
    const offsetIsLiteral = this.handleConstants(arrayStart) !== null;
    // const regUsed = this.utils.getScratchReg(regIndex);
    const addressShift = isLong ? 8 : 4;
    const indexVarMemLoc = this.getExplicitMemLocation(indexVar);
    const regLoadInstr = this.utils.buildRegMoveInstructionStr(
      indexVarMemLoc,
      regIndex,
      false // indexes are ints
    );
    const regExtended = this.utils.getLongScratchReg(regIndex);
    // const signExtendInstr =
    //   (this.isMacOS ? `movslq` : `MOVSXD`) + ` ${regUsed}, ${regExtended}`;
    const shortcutScale = offsetIsLiteral
      ? `lea ${arrayStart}(%rbp,${regExtended},${addressShift}), ${regExtended}`
      : `lea (${arrayStart},${regExtended},${addressShift}), ${regExtended}`;

    // const basePtrShiftInstr = offsetIsLiteral
    //   ? ""
    //   : `addq %rbp, ${regExtended}`;
    const endLoadComment = "# end of load instruction";

    return [
      regLoadInstr,
      // signExtendInstr, //this sign extend  may not be necessary, this is why commented out but don't delete just yet
      shortcutScale,
      // basePtrShiftInstr,
      endLoadComment,
    ]
      .filter((instr) => instr !== "")
      .join("\n");
  }

  public isArrayVar(varName: string): boolean {
    return this.arrNames.has(varName);
  }
  public isMemAddress(name: string): boolean {
    return this.isArrayVar(name) || this.strLiteralMap.has(name);
  }
  public addLongVar(varName: string) {
    this.longVars.add(varName);
  }

  public checkIsLong(varName: string): boolean {
    const longNumeral = safeParseLong(varName);
    const arrayName = varName.split(/\[|\]/)[0];
    return (
      longNumeral !== null ||
      this.longVars.has(varName) ||
      this.longVars.has(arrayName)
    );
  }
  public addStrLiteral(strLiteral: string, asmNames: string[]) {
    this.strLiteralMap.set(strLiteral, asmNames);
  }
}
