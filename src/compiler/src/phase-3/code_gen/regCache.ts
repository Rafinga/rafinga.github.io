import {
  castToIntReg,
  castToLongReg,
  isLongReg,
  LongReg,
  Reg,
} from "../RegTypes";
import { StackTracker } from "./stackTracker";
import { AsmUtils } from "./asmUtils";

export class RegCache {
  //register cache mapping
  private varToRegister: Map<string, Reg>;
  private registerToVar: Map<Reg, string>;
  private outOfSinkVars: Set<string> = new Set(); //since load reg instructions can come before
  // learning if a var is long
  private spillEnabled = true;
  private utils = new AsmUtils();
  private spilledVars: Set<string> = new Set();

  constructor(private stackTracker: StackTracker) {
    //register cache init
    this.varToRegister = new Map();
    this.registerToVar = new Map();
  }

  public clear() {
    this.varToRegister = new Map();
    this.registerToVar = new Map();
    this.outOfSinkVars.clear();
    this.spilledVars.clear();
  }

  public removeRegCacheVar(varName: string): void {
    const posReg = this.varToRegister.get(varName);
    if (posReg === undefined) {
      return;
    }
    this.registerToVar.delete(posReg);
    this.varToRegister.delete(varName);
    this.spilledVars.delete(varName);
  }

  public restoreAllRegVars(): string {
    const restoreStack: string[] = [];
    this.spilledVars.forEach((varName) => {
      restoreStack.push(this.restoreRegVar(varName));
    });
    return restoreStack.join("\n");
  }

  public restoreRegVars(varsToRestore: Set<string>): string {
    const restoreStack: string[] = [];
    this.spilledVars.forEach((varName) => {
      if (!varsToRestore.has(varName)) {
        this.spilledVars.delete(varName);
        return;
      }
      restoreStack.push(this.restoreRegVar(varName));
    });
    return restoreStack.join("\n");
  }

  public restoreRegVar(varName: string): string {
    if (!this.spilledVars.has(varName)) {
      return "";
    }
    const stackMemLoc = this.stackTracker.varToMemory.get(varName);
    if (stackMemLoc === undefined) {
      throw new Error("mem location is not stored in stack for some reason!");
    }
    const regUsed = this.varToRegister.get(varName);
    if (regUsed === undefined) {
      throw new Error("register not stored in cache!");
    }
    this.spilledVars.delete(varName);
    const isLong = this.stackTracker.checkIsLong(varName);
    const startComment = `# restoring ${varName} into register ${regUsed}`;
    const endComment = `# end of restoring ${varName}`;
    if (isLong) {
      return [startComment, `movq ${stackMemLoc}, ${regUsed}`, endComment].join(
        "\n"
      );
    }
    return [startComment, `movl ${stackMemLoc}, ${regUsed}`, endComment].join(
      "\n"
    );
  }

  // get register for a variable
  public fetchVar(varName: string, isLong: boolean | undefined): string | null {
    if (!this.spillEnabled && this.spilledVars.has(varName)) {
      return null;
    }
    if (this.outOfSinkVars.has(varName)) {
      if (isLong === undefined) {
        throw new Error("can't if reg to assign is long");
      }
      this.stackTracker.setMemLocation(varName, isLong);
      this.updateRegisterSize(varName);
    }

    if (this.varToRegister.has(varName)) {
      const varRegister = this.varToRegister.get(varName) as Reg;
      return `${varRegister}`;
    }
    return null;
  }

  // allocate a register for a variable
  public allocateRegister(varName: string, reg: Reg): void {
    let regUsed: Reg = reg;
    if (regUsed === undefined || regUsed === null) {
      throw new Error("what happened :sob:");
    }
    if (this.stackTracker.checkIsLong(varName)) {
      regUsed = castToLongReg(reg);
    } else {
      regUsed = castToIntReg(reg);
    }

    this.insertReg(varName, regUsed);
    if (!this.stackTracker.varToMemory.has(varName)) {
      this.outOfSinkVars.add(varName);
    }
  }

  private updateRegisterSize(varName: string) {
    if (!this.varToRegister.has(varName)) {
      throw new Error("variable not stored in cache!");
    }
    const ogRegUsed = this.varToRegister.get(varName);
    if (ogRegUsed === undefined) {
      throw new Error("what happened :sob:");
    }
    const newRegUsed = this.stackTracker.checkIsLong(varName)
      ? castToLongReg(ogRegUsed)
      : castToIntReg(ogRegUsed);
    this.insertReg(varName, newRegUsed);
    this.outOfSinkVars.delete(varName);
  }

  private insertReg(varName: string, regUsed: Reg): void {
    const longReg = castToLongReg(regUsed);
    const intReg = castToIntReg(regUsed);
    let posVar = this.registerToVar.get(longReg);
    posVar = posVar === undefined ? this.registerToVar.get(intReg) : posVar;
    posVar = posVar === undefined ? "" : posVar;
    const posReg = this.varToRegister.get(varName);
    if (posReg !== undefined) {
      this.registerToVar.delete(posReg);
    }
    this.registerToVar.delete(longReg);
    this.registerToVar.delete(intReg);
    this.varToRegister.delete(posVar);
    this.spilledVars.delete(posVar);
    this.varToRegister.set(varName, regUsed);
    this.registerToVar.set(regUsed, varName);
    if (this.registerToVar.size !== this.varToRegister.size) {
      throw new Error("size mismatch");
    }
  }

  public flushCache(
    regesKilled: Set<LongReg>,
    liveVars: Set<string> | null
  ): string {
    this.spillEnabled = false;
    let spillInstrs: string[] = [];
    this.registerToVar.forEach((varName, reg) => {
      if (
        this.spilledVars.has(varName) ||
        (liveVars !== null && varName in liveVars)
      ) {
        return;
      }
      const longReg = castToLongReg(reg);
      if (!regesKilled.has(longReg)) {
        return;
      }
      this.spilledVars.add(varName);
      const isLong = isLongReg(reg);
      const { memLocation: memLoc } = this.stackTracker.getAnyMemLoc(
        varName,
        1,
        isLong
      );

      spillInstrs.push(this.utils.buildMovInstructionStr(reg, memLoc, isLong));
    });
    return ["# flushing cache", ...spillInstrs].join("\n");
  }
  public enableCache(): void {
    this.spillEnabled = true;
    // this.spilledVars.clear();
  }
  public areSpillsEnabled(): boolean {
    return this.spillEnabled;
  }
}
