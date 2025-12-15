import { Datatype } from "../phase-2/semantics/datatype";
import {
  StringLiteral,
  BinaryOperation,
  LeftShiftOp,
  RightShiftOp,
  BitAndOp,
  DivideOp,
} from "../phase-2/semantics/ir";
import { ExprContainer } from "../phase-4/cseOptimizer";
import { DefContainer } from "../phase-4/dataflowUtils";
import { ControlFlowGraph } from "./cfg";
import { LongReg, ReservedLongReg } from "./RegTypes";

// checks when we are using a constant as a possible use
export function isConstantStr(posUse: string): boolean {
  const constRegex = /^-?[0-9]+[Lb]?$/;
  return constRegex.test(posUse);
}

export enum literalType {
  bool,
  int,
  long,
}
export enum BranchType {
  ifElse,
  forLoop,
  whileLoop,
}

export class BranchBlocks {
  public constructor(
    public conditionVar: string,
    public trueBlock: BasicBlock,
    public falseBlock: BasicBlock
  ) { }
}

export class BasicBlock {
  public instructions: Array<Instruction>;
  public branchSuccessors: BranchBlocks | null;
  public joinSuccessor: BasicBlock | null;
  public mutPredecessors: Set<String>;
  public mutPredecessorBlocks: Array<BasicBlock> = [];

  //support for SSA trees
  public phiInstructions: Array<PhiInstruction>;
  public allDomPredecessors: Set<BasicBlock> = new Set(); //all nodes that dominate current node
  public successors: Array<BasicBlock> = []; // CFG tre
  public predecessors: Array<BasicBlock> = [];
  public domSuccessors: Array<BasicBlock> = []; //immediate dominator tree
  public domPredecessors: Array<BasicBlock> = [];

  public in: Set<string> = new Set(); // set of variables in the block
  public out: Set<string> = new Set(); // set of variables out of the block

  public cpIn: Set<DefContainer> = new Set(); // set of variables in the block
  public cpOut: Set<DefContainer> = new Set(); // set of variables out of the block

  public aeIn: Set<ExprContainer> = new Set();
  public aeOut: Set<ExprContainer> = new Set();

  public constructor(
    public label: string,
    public curScope: number,
    public parentScope: number,
    instructions: Array<Instruction>,
    phiInstructions?: Array<PhiInstruction>
  ) {
    this.instructions = [new LabelInstruction(label), ...instructions];
    this.phiInstructions = phiInstructions || [];
    this.branchSuccessors = null;
    this.joinSuccessor = null;
    // those these are successors
    this.mutPredecessors = new Set<string>(); // predecessors
  }

  //duplicates the current block shallowly
  public duplicate(): BasicBlock {
    const dupBlock = new BasicBlock(
      this.label,
      this.curScope,
      this.parentScope,
      []
    );
    dupBlock.instructions = this.instructions.map((inst) => inst.duplicate());
    dupBlock.branchSuccessors =
      this.branchSuccessors === null
        ? null
        : new BranchBlocks(
          this.branchSuccessors.conditionVar,
          this.branchSuccessors.trueBlock,
          this.branchSuccessors.falseBlock
        );
    dupBlock.joinSuccessor = this.joinSuccessor;
    dupBlock.mutPredecessors = new Set(this.mutPredecessors);
    dupBlock.mutPredecessorBlocks = this.mutPredecessorBlocks.slice();
    // the ins and outs get altered all the time so won't bother duplicating them
    // also the things under support for ssa trees are not used in the current pipeline so
    // safe to ignore their existence

    return dupBlock;
  }

  public toString(): string {
    const instStr = this.instructions.map((inst) => inst.toString()).join("\n");
    return `${instStr}`.trim();
    // return `${instStr}`.trim();
  }

  public getSuccessors(): Array<BasicBlock> {
    if (this.joinSuccessor !== null) {
      return [this.joinSuccessor];
    } else if (this.branchSuccessors !== null) {
      return [
        this.branchSuccessors.trueBlock,
        this.branchSuccessors.falseBlock,
      ];
    }

    return [];
  }

  public getPredecessors(): Array<BasicBlock> {
    return this.mutPredecessorBlocks;
  }

  public popPredecessor(predecessor: BasicBlock) {
    this.mutPredecessors.delete(predecessor.label);
    this.mutPredecessorBlocks = this.mutPredecessorBlocks.filter(
      (p) => p.label !== predecessor.label
    );
  }
}

export class Instruction {
  public destReg: LongReg | ReservedLongReg | null = null;
  public constructor(public weight: number = 1) { }
  public toString(): string {
    return "Instruction";
  }

  public getDest(): string | null {
    return null;
  }

  public getSrcs(): Array<string> {
    return [];
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    return false;
  }

  public isConstant(): boolean {
    return this.getSrcs().every((src: string) => isConstantStr(src));
  }
  public setReg(reg: LongReg | ReservedLongReg | null): void {
    if (this.destReg !== null) {
      throw new Error("destReg already set, webs didn't merge correctly");
    }
    this.destReg = reg;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    throw new Error("addMethodNameToVarName not implemented for Instruction");
  }

  public duplicate(): Instruction {
    throw new Error("duplicate not implemented for Instruction");
  }
}

export class PhiInstruction extends Instruction {
  public variable: string;
  public sources: Map<BasicBlock, string>;

  constructor(variable: string, sources: Map<BasicBlock, string>) {
    super();
    this.variable = variable;
    this.sources = sources;
  }

  public toString(): string {
    // Extract just the source variable names, without block information
    const sourceValues = Array.from(this.sources.values()).join(", ");
    return `${this.variable} <= phi(${sourceValues})`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    // We want to check if this is an array
    if (this.variable.includes("[")) {
      let arrayName = this.variable.split("[")[0];
      let index = this.variable.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.variable = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.variable) &&
      !isConstantStr(this.variable)
    ) {
      this.variable = `${methodName}_${this.variable}`;
    }
  }

  public duplicate(): PhiInstruction {
    return new PhiInstruction(this.variable, this.sources);
  }
}

export class NegateInstruction extends Instruction {
  public constructor(public src: string, public dest: string) {
    super();
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    return `${regStr} Negate: ${this.dest} <- !${this.src}`;
  }

  public getDest(): string | null {
    return this.dest;
  }

  public getSrcs(): Array<string> {
    return [this.src].filter((arg) => !isConstantStr(arg));
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    if (srcMap.has(this.src)) {
      // console.log(`replaced ${this.src} with ${srcMap.get(this.src)}`);
      this.src = srcMap.get(this.src)!;
      return true;
    }
    return false;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): NegateInstruction {
    return new NegateInstruction(this.src, this.dest);
  }
}

export class BinOpInstruction extends Instruction {
  public expr1: string;
  public binOp: BinaryOperation;
  public expr2: string;
  public dest: string;

  public constructor(
    expr1: string,
    binOp: BinaryOperation,
    expr2: string,
    dest: string
  ) {
    super();
    this.expr1 = expr1;
    this.binOp = binOp;
    this.expr2 = expr2;
    this.dest = dest;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    return `${regStr} Binary Operation ${this.dest} <- ${this.expr1
      } ${this.binOp.toString()} ${this.expr2}`;
  }

  public getDest(): string | null {
    return this.dest;
  }

  public getSrcs(): Array<string> {
    return [this.expr1, this.expr2].filter((arg) => !isConstantStr(arg));
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    let hasChanged = false;
    if (srcMap.has(this.expr1)) {
      // console.log(`replaced ${this.expr1} with ${srcMap.get(this.expr1)}`);
      this.expr1 = srcMap.get(this.expr1)!;
      hasChanged = true;
    }
    if (srcMap.has(this.expr2)) {
      // console.log(`replaced ${this.expr2} with ${srcMap.get(this.expr2)}`);
      this.expr2 = srcMap.get(this.expr2)!;
      hasChanged = true;
    }
    return hasChanged;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.expr1.includes("[")) {
      let arrayName = this.expr1.split("[")[0];
      let index = this.expr1.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.expr1 = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.expr1) &&
      !isConstantStr(this.expr1)
    ) {
      this.expr1 = `${methodName}_${this.expr1}`;
    }

    if (this.expr2.includes("[")) {
      let arrayName = this.expr2.split("[")[0];
      let index = this.expr2.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.expr2 = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.expr2) &&
      !isConstantStr(this.expr2)
    ) {
      this.expr2 = `${methodName}_${this.expr2}`;
    }

    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): BinOpInstruction {
    return new BinOpInstruction(this.expr1, this.binOp, this.expr2, this.dest);
  }
}

export class CopyInstruction extends Instruction {
  public dest: string;
  public src: string;

  public constructor(dest: string, src: string) {
    super();
    this.dest = dest;
    this.src = src;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    return `${regStr} Copy: ${this.dest} <- ${this.src}`;
  }

  public getCombinedSrc(): string {
    return this.src;
  }

  public getCombinedDest(): string {
    return this.dest;
  }

  public getDest(): string | null {
    return this.dest;
  }

  public getSrcs(): Array<string> {
    return [this.src].filter((arg) => !isConstantStr(arg));
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    if (srcMap.has(this.src)) {
      // console.log(`replaced ${this.src} with ${srcMap.get(this.src)}`);
      this.src = srcMap.get(this.src)!;
      return true;
    }
    return false;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): CopyInstruction {
    return new CopyInstruction(this.dest, this.src);
  }
}

export class LoadConstantInstruction extends Instruction {
  public dest: string;
  public value: string;
  public literalType: literalType;

  public constructor(dest: string, value: string, literalType: literalType) {
    super();
    this.dest = dest;
    this.value = value;
    this.literalType = literalType;
  }
  public getNumericRep(): string {
    if (this.literalType === literalType.bool) {
      return `${this.value}b`;
    } else if (this.literalType === literalType.int) {
      return this.value;
    } else if (this.literalType === literalType.long) {
      return `${this.value}L`;
    }
    return this.value;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    if (this.literalType === literalType.bool) {
      return `${regStr} Load Bool Constant: ${this.dest} <- ${this.value}`;
    } else if (this.literalType === literalType.int) {
      return `${regStr} Load Int Constant: ${this.dest} <- ${this.value}`;
    } else if (this.literalType === literalType.long) {
      return `${regStr} Load Long Constant: ${this.dest} <- ${this.value}`;
    }
    return `${regStr} Load Constant: ${this.dest} <- ${this.value}`;
  }

  public getDest(): string | null {
    return this.dest;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): LoadConstantInstruction {
    return new LoadConstantInstruction(this.dest, this.value, this.literalType);
  }
}

export class CallInstruction extends Instruction {
  public methodName: string;
  public args: (StringLiteral | string)[];
  public returnVar?: string;

  public constructor(
    methodName: string,
    args: (StringLiteral | string)[],
    returnVar?: string
  ) {
    super();
    this.methodName = methodName;
    this.args = args;
    this.returnVar = returnVar;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    if (this.returnVar) {
      return `${regStr} ${this.returnVar} <- ${this.methodName
        }(${this.args.join(", ")})`;
    }
    return `${this.methodName}(${this.args.join(", ")})`;
  }
  public getSrcs(): Array<string> {
    return (
      this.args.filter((arg) => !(arg instanceof StringLiteral)) as string[]
    ).filter((arg) => {
      return !isConstantStr(arg);
    });
  }

  public getDest(): string | null {
    return this.returnVar ? this.returnVar : null;
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    let hasChanged = false;
    this.args = this.args.map((arg) => {
      if (arg instanceof StringLiteral) {
        return arg;
      }
      if (srcMap.has(arg)) {
        hasChanged = true;
        // console.log(`replaced ${arg} with ${srcMap.get(arg)}`);
        return srcMap.get(arg)!;
      }
      return arg;
    });
    return hasChanged;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    this.args = this.args.map((arg) => {
      if (!(arg instanceof StringLiteral) && arg.includes("[")) {
        let arrayName = arg.split("[")[0];
        let index = arg.split("[")[1].split("]")[0];
        if (!program.isGlobalVariable(arrayName)) {
          arrayName = `${methodName}_${arrayName}`;
        }
        if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
          index = `${methodName}_${index}`;
        }
        return `${arrayName}[${index}]`;
      } else if (
        !(arg instanceof StringLiteral) &&
        !program.isGlobalVariable(arg) &&
        !isConstantStr(arg)
      ) {
        return `${methodName}_${arg}`;
      } else {
        return arg;
      }
    });
    if (this.returnVar && this.returnVar.includes("[")) {
      let arrayName = this.returnVar.split("[")[0];
      let index = this.returnVar.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.returnVar = `${arrayName}[${index}]`;
    } else if (
      this.returnVar &&
      !program.isGlobalVariable(this.returnVar) &&
      !isConstantStr(this.returnVar)
    ) {
      this.returnVar = `${methodName}_${this.returnVar}`;
    }
  }

  public duplicate(): CallInstruction {
    return new CallInstruction(this.methodName, this.args, this.returnVar);
  }
}

export class JumpBoolInstruction extends Instruction {
  public constructor(
    public conditionVar: string,
    public currentLabel: string,
    public trueLabel: string,
    public falseLabel: string
  ) {
    super();
  }

  public toString(): string {
    return `Jump Bool: if ${this.conditionVar} then ${this.trueLabel} else ${this.falseLabel}`;
  }
  public getSrcs(): Array<string> {
    return [this.conditionVar].filter((arg) => !isConstantStr(arg));
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    if (srcMap.has(this.conditionVar)) {
      // console.log(
      //   `replaced ${this.conditionVar} with ${srcMap.get(this.conditionVar)}`
      // );
      this.conditionVar = srcMap.get(this.conditionVar)!;
      return true;
    }
    return false;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.conditionVar.includes("[")) {
      let arrayName = this.conditionVar.split("[")[0];
      let index = this.conditionVar.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.conditionVar = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.conditionVar) &&
      !isConstantStr(this.conditionVar)
    ) {
      this.conditionVar = `${methodName}_${this.conditionVar}`;
    }
  }

  public duplicate(): JumpBoolInstruction {
    return new JumpBoolInstruction(this.conditionVar, this.currentLabel, this.trueLabel, this.falseLabel);
  }
}

export class LeftShiftInstruction extends BinOpInstruction {
  public constructor(
    public dest: string,
    private src: string,
    private amount: string,
    public isNegative: boolean
  ) {
    super(src, new LeftShiftOp(), amount, dest);
  }
  public getSrcs(): Array<string> {
    return [this.src];
  }

  public getDest(): string | null {
    return this.dest;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    if (this.isNegative) {
      return `${regStr} left Shift: ${this.dest} <- -(${this.src} << ${this.amount})`;
    }
    return `${regStr} left Shift: ${this.dest} <- ${this.src} << ${this.amount}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): LeftShiftInstruction {
    return new LeftShiftInstruction(this.dest, this.src, this.amount, this.isNegative);
  }
}

export class AndModInstruction extends BinOpInstruction {
  public constructor(
    public dest: string,
    private src: string,
    private amount: string
  ) {
    super(src, new BitAndOp(), amount, dest);
  }
  public getSrcs(): Array<string> {
    return [this.src];
  }

  public getDest(): string | null {
    return this.dest;
  }
  public getAmountShifted(): string {
    if (this.amount.endsWith("L")) {
      return `${BigInt(this.amount.slice(0, -1)) - 1n}L`;
    }
    return (BigInt(this.amount) - 1n).toString();
  }
  public getAmountAnded(): string {
    return this.amount;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    return `${regStr} and mod : ${this.dest} <- ${this.src
      } & ${this.getAmountShifted()}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): AndModInstruction {
    return new AndModInstruction(this.dest, this.src, this.amount);
  }
}

export class RightShiftInstruction extends BinOpInstruction {
  public constructor(
    public dest: string,
    private src: string,
    private amount: string,
    public isNegative: boolean
  ) {
    super(src, new RightShiftOp(), amount, dest);
  }
  public getSrcs(): Array<string> {
    return [this.src];
  }

  public getDest(): string | null {
    return this.dest;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    if (this.isNegative) {
      return `${regStr} right Shift: ${this.dest} <- -(${this.src} >> ${this.amount})`;
    }
    return `${regStr} right Shift: ${this.dest} <- ${this.src} >> ${this.amount}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): RightShiftInstruction {
    return new RightShiftInstruction(this.dest, this.src, this.amount, this.isNegative);
  }
}

export class MagicDivideInstruction extends BinOpInstruction {
  public constructor(
    public dest: string,
    public src: string,
    public magicNum: number,
    public shiftNum: number,
    public addNum: number
  ) {
    super(src, new DivideOp(), magicNum.toString(), dest);
  }
  public getSrcs(): Array<string> {
    return [this.src];
  }

  public getDest(): string | null {
    return this.dest;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    return `${regStr} magic divide: ${this.dest} <- ((uint64)${this.src} * ${this.magicNum}) >> ${this.shiftNum}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): MagicDivideInstruction {
    return new MagicDivideInstruction(this.dest, this.src, this.magicNum, this.shiftNum, this.addNum);
  }
}
export class CastInstruction extends Instruction {
  public dest: string;
  public src: string;
  public castType: literalType;

  public constructor(dest: string, src: string, castType: literalType) {
    super();
    this.dest = dest;
    this.src = src;
    this.castType = castType;
  }

  public toString(): string {
    const regStr = this.destReg ? `(${this.destReg})` : "";
    if (this.castType === literalType.bool) {
      return `${regStr} Cast: ${this.dest} <- ${this.src} (bool)`;
    } else if (this.castType === literalType.int) {
      return `${regStr} Cast: ${this.dest} <- ${this.src} (int)`;
    } else if (this.castType === literalType.long) {
      return `${regStr} Cast: ${this.dest} <- ${this.src} (long)`;
    }
    return `${regStr} Cast: ${this.dest} <- ${this.src}`;
  }

  public getDest(): string | null {
    return this.dest;
  }

  public getSrcs(): Array<string> {
    return [this.src].filter((arg) => !isConstantStr(arg));
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    if (srcMap.has(this.src)) {
      this.src = srcMap.get(this.src)!;
      return true;
    }
    return false;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
    if (this.dest.includes("[")) {
      let arrayName = this.dest.split("[")[0];
      let index = this.dest.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.dest = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.dest) &&
      !isConstantStr(this.dest)
    ) {
      this.dest = `${methodName}_${this.dest}`;
    }
  }

  public duplicate(): CastInstruction {
    return new CastInstruction(this.dest, this.src, this.castType);
  }
}
export class ReturnInstruction extends Instruction {
  // a return can either return something or nothing
  public constructor(public src: string | null) {
    super();
    this.src = src;
  }

  public toString(): string {
    return this.src ? `return ${this.src}` : "return";
  }

  public getSrcs(): Array<string> {
    return this.src ? [this.src].filter((arg) => !isConstantStr(arg)) : [];
  }

  public replaceSrcs(srcMap: Map<string, string>): boolean {
    if (this.src === null) {
      return false;
    }
    if (srcMap.has(this.src)) {
      // console.log(`replaced ${this.src} with ${srcMap.get(this.src)}`);
      this.src = srcMap.get(this.src)!;
      return true;
    }
    return false;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.src && this.src.includes("[")) {
      let arrayName = this.src.split("[")[0];
      let index = this.src.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.src = `${arrayName}[${index}]`;
    } else if (
      this.src &&
      !program.isGlobalVariable(this.src) &&
      !isConstantStr(this.src)
    ) {
      this.src = `${methodName}_${this.src}`;
    }
  }

  public duplicate(): ReturnInstruction {
    return new ReturnInstruction(this.src);
  }
}

export class JumpDirectInstruction extends Instruction {
  public constructor(public label: string, public target: BasicBlock) {
    super();
    this.target = target;
  }

  public toString(): string {
    return `Jump Direct: goto ${this.label}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void { }

  public duplicate(): JumpDirectInstruction {
    return new JumpDirectInstruction(this.label, this.target);
  }
}

export class LabelInstruction extends Instruction {
  public constructor(public label: string) {
    super();
  }

  public toString(): string {
    return `Label: ${this.label}:`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void { }

  public duplicate(): LabelInstruction {
    return new LabelInstruction(this.label);
  }
}

export class CreateArrayInstruction extends Instruction {
  public constructor(
    public name: string,
    public size: number,
    public dataType: Datatype
  ) {
    super();
  }

  public toString(): string {
    return `Create Array: ${this.name}[${this.size}] of type ${this.dataType}`;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.name.includes("[")) {
      let arrayName = this.name.split("[")[0];
      let index = this.name.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.name = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.name) &&
      !isConstantStr(this.name)
    ) {
      this.name = `${methodName}_${this.name}`;
    }
  }

  public duplicate(): CreateArrayInstruction {
    return new CreateArrayInstruction(this.name, this.size, this.dataType);
  }
}

export class CreateVarInstruction extends Instruction {
  public constructor(public name: string, public dataType: Datatype) {
    super();
  }

  public toString(): string {
    return `Create Variable: ${this.name} of type ${this.dataType}`;
  }

  public getDest(): string | null {
    return this.name;
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void {
    if (this.name.includes("[")) {
      let arrayName = this.name.split("[")[0];
      let index = this.name.split("[")[1].split("]")[0];
      if (!program.isGlobalVariable(arrayName)) {
        arrayName = `${methodName}_${arrayName}`;
      }
      if (!program.isGlobalVariable(index) && !isConstantStr(index)) {
        index = `${methodName}_${index}`;
      }
      this.name = `${arrayName}[${index}]`;
    } else if (
      !program.isGlobalVariable(this.name) &&
      !isConstantStr(this.name)
    ) {
      this.name = `${methodName}_${this.name}`;
    }
  }

  public duplicate(): CreateVarInstruction {
    return new CreateVarInstruction(this.name, this.dataType);
  }
}

export class Loop {
  public constructor(
    public breakTo: BasicBlock,
    public continueTo: BasicBlock
  ) { }

  public toString(): string {
    return "Loop"; // Basic representation to avoid circular references
  }

  public addMethodNameToVarName(
    methodName: string,
    program: ControlFlowGraph
  ): void { }

  public duplicate(): Loop {
    return new Loop(this.breakTo, this.continueTo);
  }
}
