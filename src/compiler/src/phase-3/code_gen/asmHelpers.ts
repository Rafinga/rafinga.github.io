import {
  AndModInstruction,
  BasicBlock,
  BinOpInstruction,
  CallInstruction,
  CastInstruction,
  CopyInstruction,
  CreateArrayInstruction,
  CreateVarInstruction,
  Instruction,
  JumpBoolInstruction,
  JumpDirectInstruction,
  LabelInstruction,
  LeftShiftInstruction,
  literalType,
  LoadConstantInstruction,
  MagicDivideInstruction,
  NegateInstruction,
  ReturnInstruction,
  RightShiftInstruction,
} from "../cfgTypes";

import { Method, StringLiteral } from "../../phase-2/semantics/ir";
import {
  ArrayType,
  Datatype,
  LongArrayType,
  LongType,
  VoidType,
} from "../../phase-2/semantics/datatype";
import { AsmUtils } from "./asmUtils";
import { StackTracker } from "./stackTracker";
import { getLongCallerSavedRegs, LongReg, Reg } from "../RegTypes";
import { getPowOf2 } from "../../phase-4/utils";
import { Web } from "../../phase-4/WebAllocator";
import { throws } from "assert";

export class AsmHelper {
  private stackPtrShift = 0;
  private randIndex: number;
  private headerLoaded: boolean;
  private methodsLoaded: boolean;
  private methodReturnTypes: Map<string, Datatype>;
  private methodParams: string[];
  private argStoreShift: number;
  private importSet: Set<string>;
  utils: AsmUtils;
  private stackTracker: StackTracker;
  private scopeTrackers: Map<Number, StackTracker>;

  private runtimeExceptionString =
    "runtime exception fell off the end of the method \\n";
  private runtimeExcceptionLabel = "runtime_exception";
  private runtimeExceptionAsm: string;

  private isMacOS: boolean;
  private generatedBlocks: Set<string>;
  private endLabel = "";

  private webMap: Map<string, Array<Web>> | null = null;

  constructor(private methodRegesKilled: Map<string, Set<LongReg>>) {
    this.headerLoaded = false;
    this.methodsLoaded = false;
    this.methodReturnTypes = new Map();
    this.randIndex = 0;
    this.methodParams = [];
    this.argStoreShift = 8 * 2;
    this.utils = new AsmUtils();
    this.stackTracker = new StackTracker();
    this.scopeTrackers = new Map();
    this.scopeTrackers.set(0, this.stackTracker);
    this.generatedBlocks = new Set();

    // this.isMacOS = process.platform === "darwin";
    this.isMacOS = false; // Assume Linux/generic for web compilation
    this.runtimeExceptionAsm = [
      `lea ${this.runtimeExcceptionLabel}(%rip), %rdi`,
      "call " + (this.isMacOS ? "_" : "") + "printf",
      this.utils.buildRegMoveInstructionStr("$1", 0, true),
      this.utils.buildRegMoveInstructionStr("$0", 1, true),
      this.buildDivInstructionStr(true),
    ].join("\n");
    this.importSet = new Set();
  }

  public buildProgramHeader(
    imports: Array<string>,
    strLiteralMap: Map<string, number>,
    natives: Map<string, Datatype>
  ): string {
    const header = this.buildDataSegment(strLiteralMap, natives);
    if ("printf" in imports === false) {
      imports.push("printf");
    }
    const importAsms = imports
      .map((importName) => {
        this.importSet.add(importName);
        return `.extern ${importName}`;
      })
      .join("\n");
    this.headerLoaded = true;
    return header + "\n" + importAsms;
  }

  public preLoadProgramMethods(methods: Array<Method>) {
    this.methodsLoaded = true;
    for (const method of methods) {
      this.methodReturnTypes.set(method.method_name, method.returnType);
    }
  }

  private buildMethodParamLoads(): string {
    const orderedLongRegArgs = ["%rdi", "%rsi", "%rdx", "%rcx", "%r8", "%r9"];
    const orderedRegArgs = ["%edi", "%esi", "%edx", "%ecx", "%r8d", "%r9d"];
    return this.methodParams
      .map((param, index) => {
        if (index >= 6) return "";
        const isLong = this.stackTracker.checkIsLong(param);
        const { memLocation: memLoc, loadInstrs: loadIntrs } =
          this.stackTracker.getAnyMemLoc(param, 0, isLong);
        const sourceUsed = isLong
          ? orderedLongRegArgs[index]
          : orderedRegArgs[index];
        return [
          loadIntrs,
          this.utils.buildMovInstructionStr(sourceUsed, memLoc, isLong),
        ]
          .filter((str) => str.length > 0)
          .join("\n");
      })
      .join("\n");
  }
  public setWebMap(webMap: Map<string, Array<Web>>) {
    this.webMap = webMap;
  }

  public buildMethodAsm(method: Method, basicBlock: BasicBlock): string {
    if (this.headerLoaded === false) {
      throw new Error("Program header not loaded before method assembly");
    }
    if (this.methodsLoaded === false) {
      throw new Error("Program methods not loaded before method assembly");
    }
    this.storeMethodParams(method);
    this.stackPtrShift = this.findStackPtrShift(basicBlock);
    basicBlock.instructions.shift();
    const methodName = method.method_name;
    const asmContent = [
      this.buildMethodPrologue(methodName),
      this.buildBasicBlock(basicBlock, true),
      this.buildMethodEpilogue(methodName, true),
      "",
    ].join("\n");
    this.clear();

    return asmContent;
  }
  private buildDataSegment(
    strLiteralMap: Map<string, number>,
    natives: Map<string, Datatype>
  ): string {
    let dataSegment = this.isMacOS
      ? ".section __DATA,__data"
      : ".section .data";
    const strLiteralNameBase = "string_literal_";
    strLiteralMap.forEach((count, stringLiteral) => {
      const quotedStrLiteral = `${stringLiteral}`;
      const literalAsmNames = [];
      for (let i = 0; i < count; i++) {
        const strLiteralName = `${strLiteralNameBase}${this.randIndex++}`;
        literalAsmNames.push(strLiteralName);
        this.stackTracker.addLongVar(quotedStrLiteral);
        dataSegment += `\n${strLiteralName}: .string "${stringLiteral}"`;
        dataSegment += "\n.align 16";
        // not perfect with external function edge cases but ok
        break;
      }
      this.stackTracker.addStrLiteral(quotedStrLiteral, literalAsmNames);
    });
    dataSegment += `\n${this.runtimeExcceptionLabel}: .string "${this.runtimeExceptionString}"`;
    dataSegment += "\n.align 16";

    const globalVarSection = this.isMacOS
      ? ".section __DATA,__bss"
      : ".section .bss";
    let globalVars = ".align 8";
    natives.forEach((datatype, name) => {
      let totalReserved = 1;
      if (datatype instanceof ArrayType) {
        this.stackTracker.addArrName(name, datatype instanceof LongArrayType);
        totalReserved = datatype.array_size;
      }
      this.stackTracker.setGlobalDatatype(name, datatype);
      //todo in the future make ints and bools 4 bytes instead of 8

      globalVars += `\n${name}: .skip ${totalReserved * 8}`;
    });
    const textSection = this.isMacOS
      ? ".section __TEXT,__text"
      : ".section .text";
    const globalMain = this.isMacOS ? ".global _main" : ".global main";
    return [
      "# loading str literals",
      dataSegment,
      "# end of load",
      "# loading global vars",
      globalVarSection,
      globalVars,
      "# end of load",
      textSection,
      globalMain,
    ].join("\n");
  }

  private storeMethodParams(method: Method): void {
    const orderedLongRegArgs = ["%rdi", "%rsi", "%rdx", "%rcx", "%r8", "%r9"];
    const orderedRegArgs = ["%edi", "%esi", "%edx", "%ecx", "%r8d", "%r9d"];

    // first storing the param memory locations that aren't in registers
    method.params.ordered_params.slice(6).forEach(([param, field], index) => {
      this.stackTracker.setMemLocation(param, field.type instanceof LongType);
    });
    //store the rest
    method.params.ordered_params.forEach(([param, field], index) => {
      if (index < 6) {
        const isLong = field.type instanceof LongType;
        const regUsed = (
          isLong ? orderedLongRegArgs[index] : orderedRegArgs[index]
        ) as Reg;
        this.stackTracker.setMemLocation(param, isLong);
      }
      this.methodParams.push(param);
    });
  }

  private storeVarFieldDeclaration(instr: CreateVarInstruction) {
    this.stackTracker.setMemLocation(
      instr.name,
      instr.dataType instanceof LongType
    );
    return "";
  }

  private storeArrFieldDeclaration(instr: CreateArrayInstruction) {
    const isLong = instr.dataType instanceof LongArrayType;
    this.stackTracker.addArrName(instr.name, isLong);
    for (let i = instr.size - 1; i >= 0; i--) {
      const usedName = `${instr.name}[${i}]`;
      this.stackTracker.setMemLocation(usedName, isLong);
    }
    return "";
  }

  private buildLabelInstruction(instr: LabelInstruction) {
    return `${instr.label}:`;
  }

  private buildJumpBoolInstruction(
    instr: JumpBoolInstruction,
    hasFalloff: boolean,
    trueFallOff: boolean
  ): string {
    const { memLocation: memLoc, loadInstrs: loadIntrs } =
      this.stackTracker.getAnyMemLoc(instr.conditionVar, 0);
    const regMove = this.utils.buildMovInstructionStr(memLoc, "%eax", false);
    const testInstr = `test %eax, %eax`;
    const jumpFalse = `jz ${instr.falseLabel}`;
    const jumpTrue = `jnz ${instr.trueLabel}`;
    const jumpWritten = !hasFalloff
      ? [jumpFalse, jumpTrue].join("\n")
      : trueFallOff
      ? jumpFalse
      : jumpTrue;
    return [
      `# begin shortcircuit segment`,
      loadIntrs,
      regMove,
      testInstr,
      jumpWritten,
      "# end shortcircuit segment",
    ]
      .filter((str) => str.length > 0)
      .join("\n");
  }

  private buildMagicDivInstruction(instr: MagicDivideInstruction): string {
    const isLong = false; // magic division is only for ints
    const reg1 = this.utils.getScratchReg(0);
    const reg2 = this.utils.getScratchReg(1);
    const longReg1 = this.utils.getLongScratchReg(0);
    const { memLocation: src1, loadInstrs: loadSrc1Instr } =
      this.stackTracker.getAnyMemLoc(instr.src, 0, isLong);
    const initMoveInstr = `movl ${src1}, ${reg1}`;
    const regLoadSrc1Instr = `movsx ${reg1}, ${longReg1}`;

    const storeRegSrc1Instr = this.utils.buildRegMoveInstructionStr(
      this.utils.getLongScratchReg(0),
      1,
      true
    );

    const mulInstr = `imulq $${instr.magicNum}, ${longReg1}`;
    const shiftInstrMul =
      instr.addNum === 1
        ? `shr $32, ${longReg1}`
        : `sar $${32 + instr.shiftNum}, ${longReg1}`;
    const addInstr = instr.addNum === 0 ? "" : `addl ${reg2}, ${reg1}`;
    const lastShift =
      instr.addNum === 0 ? "" : `sar $${instr.shiftNum}, ${reg1}`;
    const shiftAddInstr = `sar $31, ${reg2}`;

    const subtractInstr = `subl ${reg2}, ${reg1}`;
    if (instr.destReg === null) {
      this.stackTracker.removeRegCacheVar(instr.dest);
    }
    if (instr.destReg !== null) {
      this.stackTracker.addRegCacheVar(instr.dest, instr.destReg);
    }
    const destInstrs = this.stackTracker.getAnyMemLoc(instr.dest, 1, isLong);
    const finalMoveInstr = this.utils.buildMovInstructionStr(
      reg1,
      destInstrs.memLocation,
      isLong
    );
    return [
      "# begin magic division",
      loadSrc1Instr,
      initMoveInstr,
      regLoadSrc1Instr,
      storeRegSrc1Instr,
      mulInstr,
      shiftInstrMul,
      addInstr,
      lastShift,
      shiftAddInstr,
      subtractInstr,
      destInstrs.loadInstrs,
      finalMoveInstr,
      "# end magic division",
    ].join("\n");
  }

  private buildJumpDirectInstruction(instr: JumpDirectInstruction): string {
    return `jmp ${instr.label}`;
  }

  private buildMethodPrologue(methodName: string): string {
    const basePtrSaveInstr = "push %rbp";

    const basePtrUpdateInstr = "movq %rsp, %rbp";
    const methodParamsLoadInstr = this.buildMethodParamLoads();
    const stackPtrShift = this.stackPtrShift;
    const stackPtrShiftInstr = `subq $${stackPtrShift}, %rsp`;
    const methodPrologue = this.isMacOS ? "_" : "";
    const prologueIntrs = [
      methodPrologue + methodName + ":",
      "# entering prologue",
      basePtrSaveInstr,
      // scratchRegSaveIntrs,
      basePtrUpdateInstr,
      methodParamsLoadInstr,
      stackPtrShiftInstr,
      "# exiting prologue",
    ];
    return prologueIntrs.join("\n");
  }

  private buildNegateInstruction(instr: NegateInstruction) {
    const { memLocation: memLoc, loadInstrs: loadIntrs } =
      this.stackTracker.getAnyMemLoc(instr.src, 0);
    const isLong = this.stackTracker.checkIsLong(instr.src);
    const tempRegUsed = this.utils.getScratchRegArray(isLong)[0];
    if (instr.destReg === null) {
      this.stackTracker.removeRegCacheVar(instr.dest);
    }
    if (instr.destReg !== null) {
      this.stackTracker.addRegCacheVar(instr.dest, instr.destReg);
    }
    const { memLocation: memLocDest, loadInstrs: loadIntrsDest } =
      this.stackTracker.getAnyMemLoc(instr.dest, 1, isLong);

    const asmCode = [
      `# ${instr.dest} = -${instr.src}`,
      loadIntrs,
      this.utils.buildMovInstructionStr(memLoc, tempRegUsed, isLong),
      `neg ${tempRegUsed}`,
      loadIntrsDest,
      this.utils.buildMovInstructionStr(tempRegUsed, memLocDest, isLong),
      "# negate instruction end",
    ]
      .filter((str) => str.length > 0)
      .join("\n");
    return asmCode;
  }

  private buildBranches(basicBlock: BasicBlock, isOrdered: boolean): string {
    const branchBlock = basicBlock.branchSuccessors;
    if (branchBlock === null) {
      throw new Error("branch block is null");
    }
    const trueBlock = branchBlock.trueBlock;
    const falseBlock = branchBlock.falseBlock;
    const jumpInstr = new JumpBoolInstruction(
      branchBlock.conditionVar,
      "",
      branchBlock.trueBlock.label,
      branchBlock.falseBlock.label
    );

    const trueFallOff = trueBlock.mutPredecessors.size == 1;
    const hasFalloff = trueFallOff || falseBlock.mutPredecessors.size == 1;

    const jumpAsm = this.buildJumpBoolInstruction(
      jumpInstr,
      hasFalloff,
      trueFallOff
    );

    const restoreCacheAsm = this.buildRestoreCacheAsm(basicBlock);

    if (isOrdered) {
      this.removeFromTrueBranch(basicBlock);
    }

    const trueBlockCode = this.buildBasicBlock(trueBlock, isOrdered);

    if (isOrdered) {
      this.removeFromFalseBranch(basicBlock);
    }
    const falseBlockCode = this.buildBasicBlock(falseBlock, isOrdered);

    return [
      restoreCacheAsm,
      jumpAsm,
      `# true branch code`,
      trueBlockCode,
      "# end of true branch code",
      "# false branch code",
      falseBlockCode,
      "# end of false branch code",
    ].join("\n");
  }

  private buildSuccessors(basicBlock: BasicBlock, isOrdered: boolean): string {
    const succesorBlock = basicBlock.joinSuccessor;
    if (succesorBlock === null) {
      throw new Error("succesor block is null");
    }
    const jumpInstr = new JumpDirectInstruction(
      succesorBlock.label,
      succesorBlock
    );
    const joinBlockCode = this.buildBasicBlock(succesorBlock, isOrdered);
    const jumpAsm =
      succesorBlock.mutPredecessors.size === 0
        ? ""
        : this.buildJumpDirectInstruction(jumpInstr);
    return [
      jumpAsm,
      "# new block code",
      joinBlockCode,
      "# end of new block code",
    ].join("\n");
  }
  private removeFromSuccessors(basicBlock: BasicBlock): void {
    const succesorBlock = basicBlock.joinSuccessor;
    if (succesorBlock !== null) {
      succesorBlock.mutPredecessors.delete(basicBlock.label);
    }
  }

  private removeFromTrueBranch(basicBlock: BasicBlock): void {
    const branchBlock = basicBlock.branchSuccessors;
    if (branchBlock !== null) {
      branchBlock.trueBlock.mutPredecessors.delete(basicBlock.label);
    }
  }
  private removeFromFalseBranch(basicBlock: BasicBlock): void {
    const branchBlock = basicBlock.branchSuccessors;
    if (branchBlock !== null) {
      branchBlock.falseBlock.mutPredecessors.delete(basicBlock.label);
    }
  }

  private handleShadowSuccessor(basicBlock: BasicBlock): void {
    if (basicBlock.label.startsWith("skip_") && basicBlock.joinSuccessor) {
      this.removeFromSuccessors(basicBlock);
      basicBlock.instructions.push(
        new JumpDirectInstruction(
          basicBlock.joinSuccessor.label,
          basicBlock.joinSuccessor
        )
      );
      basicBlock.joinSuccessor = null;
    }
  }

  private buildBasicBlock(basicBlock: BasicBlock, isOrdered: boolean): string {
    if (isOrdered && basicBlock.mutPredecessors.size > 0) {
      return "# skipped code for duplication";
    }
    if (!isOrdered && this.generatedBlocks.has(basicBlock.label)) {
      return "# skipped code for duplication";
    }

    if (!isOrdered) {
      const labelInstr = basicBlock.instructions[0];
      if (!(labelInstr instanceof LabelInstruction)) {
        throw new Error("First instruction is not label instruction");
      }
      labelInstr.label = basicBlock.label;
      this.handleShadowSuccessor(basicBlock);
    }
    const blockInstrs = basicBlock.instructions.map((instruction) => {
      if (instruction instanceof LoadConstantInstruction) {
        return this.buildLoadInstruction(instruction);
      }
      if (instruction instanceof ReturnInstruction) {
        return this.buildReturnInstruction(instruction);
      }
      if (instruction instanceof MagicDivideInstruction) {
        return this.buildMagicDivInstruction(instruction);
      }
      if (instruction instanceof BinOpInstruction) {
        return this.buildBinExprInstructions(instruction);
      }
      if (instruction instanceof CopyInstruction) {
        return this.buildCopyInstruction(instruction);
      }
      if (instruction instanceof CallInstruction) {
        return this.buildMethodCallInstruction(instruction);
      }
      if (instruction instanceof CastInstruction) {
        return this.buildCastInstruction(instruction);
      }
      if (instruction instanceof LabelInstruction) {
        return this.buildLabelInstruction(instruction);
      }
      if (instruction instanceof JumpDirectInstruction) {
        return this.buildJumpDirectInstruction(instruction);
      }

      if (instruction instanceof JumpBoolInstruction) {
        return ""; //handled later
      }

      if (instruction instanceof CreateVarInstruction) {
        return this.storeVarFieldDeclaration(instruction);
      }
      if (instruction instanceof CreateArrayInstruction) {
        return this.storeArrFieldDeclaration(instruction);
      }
      if (instruction instanceof NegateInstruction) {
        return this.buildNegateInstruction(instruction);
      }

      // if (instruction instanceof LoadRegInstruction) {
      //   return this.buildLoadRegInstruction(instruction);
      // }
      throw new Error("Unknown instruction");
    });
    if (!isOrdered) {
      this.generatedBlocks.add(basicBlock.label);
    }
    const blockCode = blockInstrs
      .filter((instr) => instr.length > 0)
      .join("\n");
    this.generatedBlocks.add(basicBlock.label);
    if (basicBlock.branchSuccessors) {
      return [blockCode, this.buildBranches(basicBlock, isOrdered)].join("\n");
    }
    if (basicBlock.joinSuccessor) {
      if (isOrdered) {
        this.removeFromSuccessors(basicBlock);
      }
      return [
        blockCode,
        this.buildRestoreCacheAsm(basicBlock),
        this.buildSuccessors(basicBlock, isOrdered),
      ].join("\n");
    }
    return blockCode;
  }
  private buildLoadInstruction(loadInstr: LoadConstantInstruction) {
    if (loadInstr.destReg === null) {
      this.stackTracker.removeRegCacheVar(loadInstr.dest);
    }
    if (loadInstr.destReg !== null) {
      this.stackTracker.addRegCacheVar(loadInstr.dest, loadInstr.destReg);
    }
    const isLong = loadInstr.literalType === literalType.long;
    const { memLocation: memoryLocation, loadInstrs: preloadIntrs } =
      this.stackTracker.getAnyMemLoc(loadInstr.dest, 0, isLong);
    const longCommentSuffix = isLong ? "L" : "";
    const regUsed = this.utils.getScratchRegArray(isLong)[1];
    //need to move into a register cause can't load 64 bit immediates directly :(
    const tempMove = this.utils.buildMovInstructionStr(
      `$${loadInstr.value}`,
      regUsed,
      isLong
    );
    return [
      `# ${loadInstr.dest} = ${loadInstr.value}${longCommentSuffix}`,
      preloadIntrs,
      tempMove,
      this.utils.buildMovInstructionStr(regUsed, memoryLocation, isLong),
    ]
      .filter((str) => str.length > 0)
      .join("\n");
  }
  private buildReturnInstruction(returnInstr: ReturnInstruction) {
    const returnInstructionSrc = returnInstr.src;
    if (!returnInstructionSrc)
      return "# returning \n" + this.buildMethodEpilogue();
    const { loadInstrs: loadIntrs, memLocation: returnVal } =
      this.stackTracker.getAnyMemLoc(returnInstructionSrc, 0);
    if (!returnVal) throw new Error();

    const isLong = this.stackTracker.checkIsLong(returnInstructionSrc);
    const returnReg = isLong ? "%rax" : "%eax";
    return [
      "# returning\n",
      loadIntrs,
      this.utils.buildMovInstructionStr(returnVal, returnReg, isLong),
      this.buildMethodEpilogue(),
    ].join("\n");
  }

  private isBooleanOp(op: string) {
    const booleanReturns = ["==", "!=", "<", ">", "<=", ">="];
    return booleanReturns.includes(op);
  }

  private buildBinExprInstructions(binoOpInstr: BinOpInstruction) {
    const src1Long = this.stackTracker.checkIsLong(binoOpInstr.expr1);
    const { memLocation: src1, loadInstrs: loadSrc1Instr } =
      this.stackTracker.getAnyMemLoc(binoOpInstr.expr1, 0, src1Long);
    const { memLocation: src2, loadInstrs: loadSrc2Instr } =
      this.stackTracker.getAnyMemLoc(binoOpInstr.expr2, 1, src1Long);
    const isLong = this.stackTracker.checkIsLong(binoOpInstr.expr1);
    const scratchArrUsed = this.utils.getScratchRegArray(isLong);
    const regLoadSrc1Instr = this.utils.buildRegMoveInstructionStr(
      src1,
      0,
      src1Long
    );
    const srcReg1 = scratchArrUsed[0];
    const src2Reg = scratchArrUsed[1];
    const regLoadSrc2Instr = this.utils.buildRegMoveInstructionStr(
      src2,
      1,
      src1Long
    );
    let binOpInstr: string = "";
    switch (binoOpInstr.binOp.toString()) {
      case "+":
        binOpInstr = this.buildAddInstructionStr(isLong);
        break;
      case "-":
        binOpInstr = this.buildSubInstructionStr(isLong);
        break;
      case "*":
        binOpInstr = this.buildMulInstructionStr(isLong);
        break;
      case "==":
        binOpInstr = this.buildEqInstructionStr(isLong);
        break;

      case "!=":
        binOpInstr = this.buildNeqInstructionStr(isLong);
        break;
      case "<":
        binOpInstr = this.buildLtInstructionStr(isLong);
        break;
      case ">":
        binOpInstr = this.buildGtInstructionStr(isLong);
        break;
      case "<=":
        binOpInstr = this.buildLeInstructionStr(isLong);
        break;
      case ">=":
        binOpInstr = this.buildGeInstructionStr(isLong);
        break;
      case "&&":
        binOpInstr = this.buildAndInstructionStr(isLong);
        break;
      case "||":
        binOpInstr = this.buildOrInstructionStr(isLong);
        break;

      //for both division and mod
      case "%":
        binOpInstr = this.buildModInstructionStr(isLong);
        break;
      case "/":
        binOpInstr = this.buildDivInstructionStr(isLong);
        break;
      case ">>":
        if (!(binoOpInstr instanceof RightShiftInstruction)) {
          throw new Error("incorrect instruction type");
        }

        binOpInstr = this.buildRightShiftInstructionStr(
          srcReg1,
          src2Reg,
          src2,
          binoOpInstr.isNegative,
          src1Long
        );
        break;
      case "<<":
        if (!(binoOpInstr instanceof LeftShiftInstruction)) {
          throw new Error("incorrect instruction type");
        }
        binOpInstr = this.buildLeftShiftInstructionStr(
          srcReg1,
          src2,
          binoOpInstr.isNegative
        );
        break;
      case "&":
        if (!(binoOpInstr instanceof AndModInstruction)) {
          throw new Error("incorrect instruction type");
        }
        binOpInstr = this.buildModAndInstructionStr(
          srcReg1,
          src2Reg,
          binoOpInstr.getAmountShifted(),
          binoOpInstr.getAmountAnded(),
          src1Long
        );
        break;
      default:
        console.log(binoOpInstr.binOp.toString());
        throw new Error("unrecognized bin op ! \n");
    }
    if (binoOpInstr.destReg === null) {
      this.stackTracker.removeRegCacheVar(binoOpInstr.dest);
    }
    if (binoOpInstr.destReg !== null) {
      this.stackTracker.addRegCacheVar(binoOpInstr.dest, binoOpInstr.destReg);
    }
    const bineExprResRegIdx = 0;
    const destMutateRegIdx = 1;
    const isBooleanDest = this.isBooleanOp(binoOpInstr.binOp.toString());
    const newScratchArr = isBooleanDest
      ? this.utils.getScratchRegArray(false)
      : scratchArrUsed;
    const isDestLong = src1Long && !isBooleanDest;
    const { memLocation: destMemLoc, loadInstrs: destLoadIntrs } =
      this.stackTracker.getAnyMemLoc(
        binoOpInstr.dest,
        destMutateRegIdx,
        isDestLong
      );
    const storeDestInstr = this.utils.buildMovInstructionStr(
      newScratchArr[bineExprResRegIdx],
      destMemLoc,
      isDestLong
    );
    const startComment = `# ${binoOpInstr.dest} = ${
      binoOpInstr.expr1
    } ${binoOpInstr.binOp.toString()} ${binoOpInstr.expr2}`;
    const endComment = "# end of bin op";
    return [
      startComment,
      loadSrc1Instr,
      regLoadSrc1Instr,
      loadSrc2Instr,
      regLoadSrc2Instr,
      binOpInstr,
      destLoadIntrs,
      storeDestInstr,
      endComment,
    ]
      .filter((str) => str.length > 0)
      .join("\n");
  }
  private buildRightShiftInstructionStr(
    reg1: string,
    reg2: string,
    immediate: string,
    isNeg: boolean,
    isLong: boolean
  ): string {
    const dollarLessImmediate = immediate.slice(1);
    const bttExtractVal = (
      (BigInt(1) << BigInt(dollarLessImmediate)) -
      1n
    ).toString();
    const suffix = isLong ? "q" : "l";
    const moveInstr = this.utils.buildMovInstructionStr(reg1, reg2, isLong);
    const signInstr = isLong ? `sar $63, ${reg2}` : `sar $31, ${reg2}`;
    const getValToAddInstr = `and${suffix} $${bttExtractVal}, ${reg2}`;
    const boundInstr = `add${suffix} ${reg2}, ${reg1}`;
    const negateInstr = isNeg ? `NEG ${reg1}` : "";
    const shiftInstr = `sar ${immediate}, ${reg1}`;
    return [
      moveInstr,
      signInstr,
      getValToAddInstr,
      boundInstr,
      shiftInstr,
      negateInstr,
    ]
      .filter((instr) => instr !== "")
      .join("\n");
  }
  private buildLeftShiftInstructionStr(
    reg: string,
    immediate: string,
    isNeg: boolean
  ): string {
    const negateInstr = isNeg ? `NEG ${reg}` : "";
    const shiftInstr = `sal ${immediate}, ${reg}`;
    return [shiftInstr, negateInstr].filter((instr) => instr !== "").join("\n");
  }

  private buildModAndInstructionStr(
    reg1: string,
    reg2: string,
    andImmediate: string,
    ogNum: string,
    isLong: boolean
  ): string {
    const suffix = isLong ? "q" : "l";
    const shiftAmmount = isLong ? "63" : "31";
    const leftShiftAmount = getPowOf2(ogNum);
    if (leftShiftAmount === null) {
      throw new Error("left shift amount is null");
    }
    const storeMove = this.utils.buildMovInstructionStr(reg1, reg2, isLong);
    const andInstr = `and${suffix} $${andImmediate}, ${reg1}`;
    const shiftInstr = `sar $${shiftAmmount}, ${reg2}`; // is 0 or -1
    const rescaleInstr = `sal $${leftShiftAmount}, ${reg2}`; // is 0 or -immeditate
    const rangeShift = `add${suffix} ${reg2}, ${reg1}`;
    return [storeMove, andInstr, shiftInstr, rescaleInstr, rangeShift].join(
      "\n"
    );
  }

  private buildCopyInstruction(copyInstr: CopyInstruction) {
    const instrSrc = copyInstr.getCombinedSrc();
    const instrDest = copyInstr.getCombinedDest();
    const srcMutateReg = 0;
    const destMutateReg = 1;
    const { memLocation: src, loadInstrs: srcLoadIntrs } =
      this.stackTracker.getAnyMemLoc(instrSrc, srcMutateReg);
    const isLong = this.stackTracker.checkIsLong(instrSrc);
    const scratchArrUsed = this.utils.getScratchRegArray(isLong);
    const interimmovle = this.utils.buildRegMoveInstructionStr(
      src,
      srcMutateReg,
      isLong
    );
    if (copyInstr.destReg === null) {
      this.stackTracker.removeRegCacheVar(copyInstr.dest);
    }
    if (copyInstr.destReg !== null) {
      this.stackTracker.addRegCacheVar(copyInstr.dest, copyInstr.destReg);
    }
    const { memLocation: dest, loadInstrs: destLoadIntrs } =
      this.stackTracker.getAnyMemLoc(instrDest, destMutateReg, isLong);
    const actualmovle = this.utils.buildMovInstructionStr(
      scratchArrUsed[srcMutateReg],
      dest,
      isLong
    );

    const startComment = `# ${instrDest} = ${instrSrc}`;
    const endComment = "# end of copy instruction";
    return [
      startComment,
      srcLoadIntrs,
      interimmovle,
      destLoadIntrs,
      actualmovle,
      endComment,
    ]
      .filter((str) => str.length > 0)
      .join("\n");
  }

  private buildRestoreCacheAsm(curBlock: BasicBlock): string {
    const blockInstrs = curBlock.instructions;
    const lastInstr = blockInstrs[blockInstrs.length - 1];

    const liveWebs: Set<Web> = new Set();

    if (this.webMap === null) {
      return this.stackTracker.restoreAllCacheVars();
    }

    this.webMap.forEach((webs) => {
      webs.forEach((web) => {
        if (web.liveRange.has(lastInstr) || web.entry.has(lastInstr)) {
          liveWebs.add(web);
        }
      });
    });

    const sucLabels: Set<Instruction> = new Set();
    curBlock.getSuccessors().forEach((succ) => {
      sucLabels.add(succ.instructions[0]);
    });

    liveWebs.forEach((web) => {
      let isKilled = true;
      sucLabels.forEach((labelInstr) => {
        if (web.liveRange.has(labelInstr)) {
          isKilled = false;
        }
      });
      if (isKilled) {
        liveWebs.delete(web);
      }
    });

    const restoreVars = new Set([...liveWebs].map((web) => web.varName));

    const reloadInstrs = this.stackTracker.restoreSomeCacheVars(restoreVars);
    if (reloadInstrs.length === 0) {
      return "";
    }
    return ["# restoring cache", reloadInstrs, "# end of restoring cache"].join(
      "\n"
    );
  }

  private buildMethodCallInstruction(callInstr: CallInstruction) {
    // right now this is enough as all are variables are in stack except callee saved ones
    const commentPreffix = callInstr.returnVar
      ? `${callInstr.returnVar} = `
      : "";
    const methodCallStartEmptyComment = `# ${
      callInstr.methodName
    }(${callInstr.args.join(", ")})`;
    const methodCallStartStoreComment = `# ${commentPreffix}${
      callInstr.methodName
    }(${callInstr.args.join(", ")})`;
    const methocdCallStartComment = callInstr.returnVar
      ? methodCallStartStoreComment
      : methodCallStartEmptyComment;
    // const varsToRestore = this.stackTracker.getVarsToReload();
    let regesKilled = this.methodRegesKilled.get(callInstr.methodName);
    regesKilled =
      regesKilled === undefined ? getLongCallerSavedRegs() : regesKilled;
    // const flushInstrs = this.stackTracker.flushCache(regesKilled);
    // const varsToRestore = this.stackTracker.getVarsToReload();
    const callArgLoading = this.buildMethodCallArgLoading(callInstr);
    const liveVars = this.findLiveVarsAfterInstr(callInstr);
    const flushInstrs = this.stackTracker.flushCache(regesKilled, liveVars); //flush surviving reges after loading args
    const methodCallAsm =
      "call " + (this.isMacOS ? "_" : "") + callInstr.methodName;
    this.stackTracker.enableCache();
    // const regRestoreInstrs = this.buildRestoreCacheAsm();

    if (callInstr.returnVar) {
      if (callInstr.destReg === null) {
        this.stackTracker.removeRegCacheVar(callInstr.returnVar);
      }
      if (callInstr.destReg !== null) {
        this.stackTracker.addRegCacheVar(
          callInstr.returnVar,
          callInstr.destReg
        );
      }
      this.stackTracker.enableCache();
      const isLong = this.isMethodReturnLong(callInstr.methodName);
      const returnReg = isLong ? "%rax" : "%eax";
      const { memLocation: returnMemLoc, loadInstrs: loadIntrs } =
        this.stackTracker.getAnyMemLoc(callInstr.returnVar, 0, isLong);
      const returnToVarAsm = this.utils.buildMovInstructionStr(
        returnReg,
        returnMemLoc,
        isLong
      );
      return [
        methocdCallStartComment,
        callArgLoading,
        flushInstrs,
        methodCallAsm,
        loadIntrs,
        // regRestoreInstrs,
        returnToVarAsm,
        this.buildExternStackOffLoading(callInstr),
        "# end of method call",
      ]
        .filter((str) => str.length > 0)
        .join("\n");
    }
    return [
      methocdCallStartComment,
      callArgLoading,
      flushInstrs,
      methodCallAsm,
      // regRestoreInstrs,
      this.buildExternStackOffLoading(callInstr),
      "# end of method call",
    ].join("\n");
  }

  private findLiveVarsAfterInstr(instr: Instruction): Set<string> | null {
    if (this.webMap === null) {
      return null;
    }
    const curWebs: Set<string> = new Set();
    this.webMap.forEach((webs) => {
      webs
        .filter((web) => !web.isLastUse(instr))
        .forEach((web) => curWebs.add(web.varName));
    });
    return curWebs;
  }

  private buildMethodCallRegArgLoading(callInstr: CallInstruction): string {
    const orderedLongRegArgs = ["%rdi", "%rsi", "%rdx", "%rcx", "%r8", "%r9"];
    const orderedRegArgs = ["%edi", "%esi", "%edx", "%ecx", "%r8d", "%r9d"];
    const paramLoadStr = callInstr.args
      .slice(0, 6)
      .map((param, index) => {
        const toLongReg = orderedLongRegArgs[index] as LongReg;

        const isString = param instanceof StringLiteral;
        const strParam = isString ? param.val : param.toString();
        const isMemAddress = this.stackTracker.isMemAddress(strParam);
        const isLong = this.stackTracker.checkIsLong(strParam) || isMemAddress;
        const regUsed = isLong
          ? orderedLongRegArgs[index]
          : orderedRegArgs[index];
        const strLiteralVar = isString
          ? this.stackTracker.getstrLiteral(strParam)
          : null;
        const liveVars = this.findLiveVarsAfterInstr(callInstr);
        if (strLiteralVar !== null) {
          const flushInstr = this.stackTracker.flushCache(
            new Set([toLongReg]),
            liveVars
          );
          const storeInstr = `lea ${strLiteralVar}(%rip), ${regUsed}`;
          return [flushInstr, storeInstr].join("\n");
        }
        const { memLocation: methodArg, loadInstrs: loadIntrs } =
          this.stackTracker.getAnyMemLoc(strParam, 0);
        const flushInstr = this.stackTracker.flushCache(
          new Set([toLongReg]),
          liveVars
        );
        return [
          loadIntrs,
          flushInstr,
          this.utils.buildMovInstructionStr(methodArg, regUsed, isLong),
        ]
          .filter((str) => str.length > 0)
          .join("\n");
      })
      .join("\n");
    return [
      `# beginning of ${callInstr.methodName} reg arg loading:`,
      paramLoadStr,
      "# end of reg arg loading",
    ].join("\n");
  }

  private buildDCAFStackArgLoading(callInstr: CallInstruction): string {
    let rbpCount = this.argStoreShift;
    const paramLoadStr = callInstr.args
      .slice(6)
      .map((param) => {
        const isString = param instanceof StringLiteral;
        const strParam = isString ? param.val : param.toString();
        const isMemAddress = this.stackTracker.isMemAddress(strParam);
        const isLong = this.stackTracker.checkIsLong(strParam) || isMemAddress;
        const memOffset = this.utils.calculateNextAddressOffset(
          rbpCount,
          isLong
        );
        rbpCount = rbpCount + memOffset;
        const memUsed = `${-rbpCount}(%rsp)`;
        const { memLocation: methodArg, loadInstrs: loadIntrs } =
          this.stackTracker.getAnyMemLoc(strParam, 0);
        const interimReg = this.utils.getScratchRegArray(isLong)[0];
        return [
          loadIntrs,
          this.utils.buildRegMoveInstructionStr(methodArg, 0, isLong), // in case we are using arguments passed from the stack
          this.utils.buildMovInstructionStr(interimReg, memUsed, isLong),
        ]
          .filter((str) => str.length > 0)
          .join("\n");
      })
      .join("\n");
    return [
      `# beginning of ${callInstr.methodName} stack arg loading:`,
      paramLoadStr,
      "# end of stack arg loading",
    ].join("\n");
  }

  private buildExternStackArgLoading(callInstr: CallInstruction): string {
    const paramLoadStr = callInstr.args
      .slice(6)
      .reverse()
      .map((param) => {
        const isString = param instanceof StringLiteral;
        const strParam = isString ? param.val : param.toString();
        const isMemAddress = this.stackTracker.isMemAddress(strParam);
        const isLong = this.stackTracker.checkIsLong(strParam) || isMemAddress;
        const { memLocation: methodArg, loadInstrs: loadIntrs } =
          this.stackTracker.getAnyMemLoc(strParam, 0);
        const strLiteralVar = isString
          ? this.stackTracker.getstrLiteral(strParam)
          : null;
        if (strLiteralVar !== null) {
          return [
            `lea ${strLiteralVar}(%rip), ${this.utils.getLongScratchReg(0)}`,
            `push ${this.utils.getLongScratchReg(0)}`,
          ].join("\n");
        }
        return [
          loadIntrs,
          this.utils.buildRegMoveInstructionStr(methodArg, 0, isLong),
          `push ${this.utils.getLongScratchReg(0)}`,
        ]
          .filter((str) => str.length > 0)
          .join("\n");
      })
      .join("\n");
    const alignmentInstr =
      callInstr.args.length > 6 && callInstr.args.length % 2 == 1
        ? "push %rax"
        : "";
    return [
      `# beginning of ${callInstr.methodName} stack arg loading:`,
      alignmentInstr,
      paramLoadStr,
      "# end of stack arg loading",
    ].join("\n");
  }
  private buildExternStackOffLoading(callInstr: CallInstruction): string {
    const isImported = this.importSet.has(callInstr.methodName);
    if (!isImported) return "";
    return [
      "# restoring extern call stack",
      this.buildExternStackArgLoading(callInstr)
        .split("\n")
        .filter((instr) => instr.startsWith("push"))
        .map((instr) => instr.replace("push", "pop"))
        .join("\n"),

      "# end of restoring extern call stack",
    ].join("\n");
  }

  private buildMethodCallStackArgLoading(callInstr: CallInstruction): string {
    const isImported = this.importSet.has(callInstr.methodName);
    return isImported
      ? this.buildExternStackArgLoading(callInstr)
      : this.buildDCAFStackArgLoading(callInstr);
  }

  private buildMethodCallArgLoading(callInstr: CallInstruction): string {
    return [
      this.buildMethodCallRegArgLoading(callInstr),
      this.buildMethodCallStackArgLoading(callInstr),
    ].join("\n");
  }

  private buildCastInstruction(castInstr: CastInstruction): string {
    const isLongDest = castInstr.castType === literalType.long;

    if (isLongDest) {
      this.stackTracker.addLongVar(castInstr.dest);
    }
    //todo check more carefully in the future maybe?
    const clearTempRegInstr = this.utils.buildRegMoveInstructionStr(
      "$0",
      0,
      true
    );
    const isLongSrc = this.stackTracker.checkIsLong(castInstr.src);
    const signExtendInstr =
      isLongDest && !isLongSrc
        ? `movsx ${this.utils.getScratchReg(0)}, ${this.utils.getLongScratchReg(
            0
          )}`
        : "";
    const { memLocation: memSrc, loadInstrs: srcLoadIntrs } =
      this.stackTracker.getAnyMemLoc(castInstr.src, 0, isLongSrc);
    if (castInstr.destReg === null) {
      this.stackTracker.removeRegCacheVar(castInstr.dest);
    }
    if (castInstr.destReg !== null) {
      this.stackTracker.addRegCacheVar(castInstr.dest, castInstr.destReg);
    }
    const { memLocation: memDest, loadInstrs: destLoadIntrs } =
      this.stackTracker.getAnyMemLoc(castInstr.dest, 1, isLongDest);
    const destReg = this.utils.getScratchRegArray(isLongDest)[0];

    const dataMoveInstr = this.utils.buildRegMoveInstructionStr(
      memSrc,
      0,
      isLongSrc
    );
    const dataMoveInstr2 = this.utils.buildMovInstructionStr(
      destReg,
      memDest,
      isLongDest
    );

    const startComment = `# ${castInstr.dest} = ${
      literalType[castInstr.castType]
    }(${castInstr.src})`;
    const endComment = "# end of cast";
    return [
      startComment,
      clearTempRegInstr,
      srcLoadIntrs,
      dataMoveInstr,
      signExtendInstr,
      destLoadIntrs,
      dataMoveInstr2,
      endComment,
    ]
      .filter((str) => str.length > 0)
      .join("\n");
  }

  private buildMethodEpilogue(methodName?: string, isFinal = false): string {
    const basePtrRestoreInstr = "pop %rbp";
    const stackPtrShift = this.stackPtrShift;
    const stackPtrRestoreInstr = `addq $${stackPtrShift}, %rsp`;
    //main needs to return a value if execution is valid
    const mainAppend = methodName === "main" ? "xor %rax, %rax" : "";
    const exceptionAsm =
      methodName != undefined &&
      !(this.methodReturnTypes.get(methodName) instanceof VoidType)
        ? this.runtimeExceptionAsm
        : "";
    const exitInstr = "ret";
    const endLabelInstr =
      isFinal && this.endLabel !== "" ? `${this.endLabel}:` : "";
    const epilogueIntrs = [
      "# entering epilogue",
      endLabelInstr,
      exceptionAsm,
      stackPtrRestoreInstr,
      basePtrRestoreInstr,
      mainAppend,
      exitInstr,
      "# exiting epilogue",
    ];
    return epilogueIntrs.filter((str) => str.length > 0).join("\n");
  }
  private clear() {
    this.stackTracker.clear();
    this.stackPtrShift = 0;
    this.methodParams = [];
    this.argStoreShift = 8 * 2; // start of memory for method params shifted by return adress
    // and base pointer
    this.scopeTrackers.clear();
    this.scopeTrackers.set(0, this.stackTracker);
    this.generatedBlocks.clear();
  }

  private isMethodReturnLong(methodName: string): boolean {
    const returnType = this.methodReturnTypes.get(methodName) as Datatype;
    return returnType instanceof LongType;
  }

  private buildAddInstructionStr(isLong: boolean): string {
    return this.builbinOpInsructionStr("add", isLong);
  }
  private buildSubInstructionStr(isLong: boolean): string {
    return this.builbinOpInsructionStr("sub", isLong);
  }
  private buildMulInstructionStr(isLong: boolean): string {
    return this.builbinOpInsructionStr("imul", isLong);
  }

  private buildEqInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("e", isLong);
  }
  private buildNeqInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("ne", isLong);
  }

  private buildLtInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("l", isLong);
  }

  private buildLeInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("le", isLong);
  }
  private buildGtInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("g", isLong);
  }

  private buildGeInstructionStr(isLong: boolean): string {
    return this.buildCompInstructionStr("ge", isLong);
  }
  private buildCompInstructionStr(
    instructionSuffix: string,
    isLong: boolean
  ): string {
    const scratchArrUsed = this.utils.getScratchRegArray(isLong);
    const opSuffix = isLong ? "q" : "l";
    const CompareInstr = `cmp${opSuffix} ${scratchArrUsed[1]}, ${scratchArrUsed[0]}`;
    const byteReg = `${this.utils.getLongScratchReg(1)}b`;
    const setInstr = `set${instructionSuffix} ${byteReg} `; //sets lowest byte of reg to 1
    const intReg = this.utils.getScratchReg(0);
    const fillInstr = `movzx ${byteReg}, ${intReg}`;
    return [CompareInstr, setInstr, fillInstr].join("\n");
  }

  private buildDivInstructionStr(isLong: boolean): string {
    const scratchArrUsed = this.utils.getScratchRegArray(isLong);
    const suffix = isLong ? "q" : "l";
    const loadReg = isLong ? "%rax" : "%eax";
    const signExtendInstr = isLong ? "cqo" : "cltd";
    const tempBinOpInstr = `idiv${suffix} ${scratchArrUsed[1]}`;
    const moveBackInstr = this.utils.buildMovInstructionStr(
      loadReg,
      scratchArrUsed[0],
      isLong
    );
    return [
      // loadIntr,
      signExtendInstr,
      tempBinOpInstr,
      moveBackInstr,
    ].join("\n");
  }
  private buildModInstructionStr(isLong: boolean): string {
    const scratchArrUsed = this.utils.getScratchRegArray(isLong);
    const suffix = isLong ? "q" : "l";
    const modReg = isLong ? "%rdx" : "%edx";
    const signExtendInstr = isLong ? "cqo" : "cltd";
    const tempBinOpInstr = `idiv${suffix} ${scratchArrUsed[1]}`;
    const moveBackInstr = this.utils.buildMovInstructionStr(
      modReg,
      scratchArrUsed[0],
      isLong
    );
    return [
      // loadInstr,
      signExtendInstr,
      tempBinOpInstr,
      moveBackInstr,
    ].join("\n");
  }
  private buildAndInstructionStr(isLong: boolean): string {
    return this.builbinOpInsructionStr("and", isLong);
  }

  private buildOrInstructionStr(isLong: boolean): string {
    return this.builbinOpInsructionStr("or", isLong);
  }

  private builbinOpInsructionStr(instrName: string, isLong: boolean): string {
    const scratchArray = this.utils.getScratchRegArray(isLong);
    const suffix = this.utils.getInstrSuffix(isLong);
    return `${instrName}${suffix} ${scratchArray[1]}, ${scratchArray[0]}`;
  }

  private findStackPtrShift(basicBlock: BasicBlock): number {
    const saveTracker = this.stackTracker.duplicate();
    const saveMethodParams = [...this.methodParams];
    this.buildBasicBlock(basicBlock, false);
    const stackPtrShift = this.stackTracker.getMaxStackPtr() + 16;
    this.stackTracker = saveTracker;
    this.scopeTrackers.set(0, this.stackTracker);
    this.methodParams = saveMethodParams;
    const declSize = 8;
    const prologueSavedSpace = declSize * 2; // base pointer, return address
    const numBytesRequired = stackPtrShift;
    const currentSpacing = prologueSavedSpace + numBytesRequired;
    let extraShift = 0;
    switch (currentSpacing % 16) {
      case 0:
        extraShift = 0;
        break;
      case 4:
        extraShift = 12;
        break;
      case 8:
        extraShift = 8;
        break;
      case 12:
        extraShift = 4;
        break;
    }
    return extraShift + numBytesRequired;
  }
}
