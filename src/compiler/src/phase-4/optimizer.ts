import { ControlFlowGraph } from "../phase-3/cfg";
import {
  AndModInstruction,
  BasicBlock,
  BinOpInstruction,
  CastInstruction,
  CopyInstruction,
  Instruction,
  LeftShiftInstruction,
  literalType,
  LoadConstantInstruction,
  MagicDivideInstruction,
  RightShiftInstruction,
} from "../phase-3/cfgTypes";
import { CpOptimizer } from "./cpOptimizer";
import { DceOptimizer } from "./dceOptimizer";
import { CseOptimizer } from "./cseOptimizer";
import { LoopOptimizer } from "./loopOptimizer";
import { foldInstr, getNegPowOf2, getPowOf2, safeExtractNum } from "./utils";
import { CastExpr, Method, MinusOp, MultiplyOp } from "../phase-2/semantics/ir";
import { computeSignedMagic, getMagicAndShift } from "./magicReader";
import { Inliner } from "./Inliner";
import { LongType, VoidType } from "../phase-2/semantics/datatype";

interface OptimizationFlags {
  constantPropagation: boolean;
  deadCodeElimination: boolean;
  algebraicSimplification: boolean;
  constantFolding: boolean;
  commonSubexprElimination: boolean; //cse flag
  loopOptimization: boolean;
  inline: boolean;
}

export class Optimizer {
  private nodes: Map<string, Array<BasicBlock>> = new Map();
  private dceOptimizer: DceOptimizer;
  private cpOptimizer: CpOptimizer;
  private cseOptimizer: CseOptimizer;
  private loopOptimizer: LoopOptimizer;
  private inliner: Inliner;
  private flags: OptimizationFlags = {
    constantPropagation: false,
    deadCodeElimination: false,
    algebraicSimplification: false,
    commonSubexprElimination: false, // Initialize CSE flag
    constantFolding: false,
    loopOptimization: false,
    inline: false,
  };

  private methodMap: Map<string, Method> = new Map();
  private localMethodSet: Set<string> = new Set();

  constructor(private program: ControlFlowGraph, methods: Method[]) {
    this.dceOptimizer = new DceOptimizer(this.program, this.localMethodSet);
    this.cpOptimizer = new CpOptimizer(this.program);
    this.cseOptimizer = new CseOptimizer(this.program, this.localMethodSet);
    this.loopOptimizer = new LoopOptimizer(this.program);
    this.inliner = new Inliner(this.program);
    methods.forEach((method) => {
      this.methodMap.set(method.method_name, method);
    });
  }

  public setOptimizationFlags(flags: OptimizationFlags) {
    this.flags = flags;
  }

  public buildNodes(): Array<BasicBlock> {
    const blocks = this.program.buildCFG();
    const fakeBlock = new BasicBlock("fakeBlock", -1, -1, []);
    blocks.forEach((block, index) => {
      this.program.addPredecessor(block, fakeBlock);
      const blockName: string = this.program.orderedMethods[index];
      this.nodes.set(blockName, this.buildMethodNodes(block));
      this.addHeaderCopies(block, blockName);
    });
    this.optimize();
    blocks.forEach((block) => {
      block.popPredecessor(fakeBlock);
    });
    return blocks;
  }
  //some optimizations like cp need to know that method parameters
  // are assigned, so we add copy instructions from var to var to solve this
  private addHeaderCopies(block: BasicBlock, methodName: string) {
    const methodInfo = this.methodMap.get(methodName);
    if (methodInfo === undefined) {
      throw new Error(`Method ${methodName} not found`);
    }
    const prependinstrs: Instruction[] = methodInfo.params.ordered_params.map(
      (param) => {
        const paramName = param[0];
        return new CopyInstruction(paramName, paramName);
      }
    );
    const labelInstr = block.instructions.shift() as Instruction;
    block.instructions = [labelInstr, ...prependinstrs].concat(
      block.instructions
    );
  }

  protected buildMethodNodes(method: BasicBlock): Array<BasicBlock> {
    const nodes: Array<BasicBlock> = [method];
    const finalBlock: BasicBlock = this.getFinalBlock(method);

    const visited: Set<string> = new Set([method.label, finalBlock.label]);
    const queue: Array<BasicBlock> = [method];

    while (queue.length > 0) {
      const currentBlock: BasicBlock = queue.pop() as BasicBlock;

      currentBlock.getSuccessors().forEach((successor) => {
        if (!visited.has(successor.label)) {
          visited.add(successor.label);
          queue.push(successor);
          nodes.push(successor);
        }
      });
    }

    if (method.label !== finalBlock.label) {
      nodes.push(finalBlock);
    }

    return nodes;
  }

  protected getFinalBlock(method: BasicBlock): BasicBlock {
    let curBlock: BasicBlock | null = method;

    while (curBlock.getSuccessors().length > 0) {
      const successors: Array<BasicBlock> = curBlock.getSuccessors();
      curBlock = successors[successors.length - 1];
    }

    return curBlock;
  }

  protected optimize() {
    // Perform optimization passes
    for (let [methodName, blocks] of this.nodes.entries()) {
      const maxPasses = 4;
      let changed = true;
      let passCount = 0;
      const firstBlock = blocks[0];
      if (this.flags.inline) {
        this.inliner.addMethod(
          firstBlock,
          this.methodMap.get(methodName)!.returnType instanceof VoidType
        );
        this.inliner.inlineAll(firstBlock, methodName);
      }
      blocks = this.buildMethodNodes(firstBlock);
      while (changed && passCount < maxPasses) {
        passCount++;
        changed = false;

        // Run CSE first since it introduces temporaries
        if (this.flags.commonSubexprElimination) {
          const cseChanged =
            this.cseOptimizer.eliminateCommonSubexpressions(blocks);
          changed = changed || cseChanged;
        }

        // Run CP to clean up temporaries introduced by CSE
        if (this.flags.constantPropagation) {
          this.cpOptimizer.propagateConstants(blocks, methodName);
          changed = true;
        }

        // Run DCE to remove dead temporaries
        if (this.flags.deadCodeElimination) {
          this.dceOptimizer.eliminateDeadCode(blocks, methodName);
          changed = true;
        }

        // Additional optimization passes
        if (this.flags.algebraicSimplification) {
          const simplifyChanged = this.simplifyExpressions(blocks);
          changed = changed || simplifyChanged;
        }

        if (this.flags.constantFolding) {
          const foldingChanged = this.constantFolding(blocks);
          changed = changed || foldingChanged;
        }

        // if (this.flags.loopOptimization) {
        //   this.loopOptimizer.optimizeLoops(blocks);
        //   changed = true;
        // }
      }
      if (this.flags.algebraicSimplification) {
        const simplifyChanged = this.mutateExpressions(blocks); //changes complex ops into shifting ops and magic ops
        changed = changed || simplifyChanged;
      }

      // Add no-op blocks at the end of blocks with no successors for assembler
      // const noOpBlock = new BasicBlock(`NoOp${this.noOpCounter++}`, 0, -1, []);
      // blocks.forEach((block) => {
      //   if (block.getSuccessors().length === 0) {
      //     this.program.addBlockSuccesor(block, noOpBlock);
      //   }
      // });
    }
  }

  private simplifyExpressions(blocks: BasicBlock[]): boolean {
    let changed = false;

    blocks.forEach((block) => {
      const originalInstructions = [...block.instructions];
      const newInstructions: Instruction[] = [];
      block.instructions.forEach((instr) => {
        if (instr instanceof BinOpInstruction) {
          const simplified = this.simpleSimplifyBinExpr(instr);
          simplified.weight = instr.weight;
          if (simplified !== instr) {
            changed = true;
            newInstructions.push(simplified);
            return simplified;
          }
        }

        if (instr instanceof CastInstruction) {
          const simplified = this.simpleSimplifyCastInstr(instr);
          simplified.weight = instr.weight;
          if (simplified !== instr) {
            changed = true;
            newInstructions.push(simplified);
            return simplified;
          }
        }
        newInstructions.push(instr);
        return instr;
      });
      block.instructions = newInstructions;

      // Check if instructions were changed
      if (block.instructions.length !== originalInstructions.length) {
        changed = true;
      } else {
        for (let i = 0; i < block.instructions.length; i++) {
          if (block.instructions[i] !== originalInstructions[i]) {
            changed = true;
            break;
          }
        }
      }
    });

    return changed;
  }

  private mutateExpressions(blocks: BasicBlock[]) {
    let changed = false;

    blocks.forEach((block) => {
      const newInstructions: Instruction[] = [];
      block.instructions.forEach((instr) => {
        if (instr instanceof BinOpInstruction) {
          const simplified = this.simplifyBinExpr(instr);
          simplified.forEach((simpInstr) => {
            if (simpInstr !== instr) {
              simpInstr.weight = instr.weight;
              changed = true;
              newInstructions.push(simpInstr);
            } else {
              newInstructions.push(instr);
            }
          });
          return;
        }
        newInstructions.push(instr);
      });
      block.instructions = newInstructions;
    });

    return changed;
  }

  private castLongToInt(numStr: string): string {
    const usedStr = numStr.slice(0, -1);
    // Parse as BigInt to avoid overflow
    let longVal: bigint = BigInt(usedStr);

    // Mask to 32 bits and cast to signed int
    let int32 = Number(longVal & BigInt(0xffffffff));

    // Convert to signed 32-bit if necessary
    if (int32 >= 0x80000000) {
      int32 = int32 - 0x100000000;
    }

    return int32.toString();
  }
  private simpleSimplifyCastInstr(instr: CastInstruction): Instruction {
    const src = instr.src;
    const numParse = safeExtractNum(src);
    if (numParse === null) {
      return instr;
    }
    if (instr.castType === literalType.long) {
      const rawNum = numParse.endsWith("L") ? numParse.slice(0, -1) : numParse;
      return new LoadConstantInstruction(
        instr.dest,
        `${rawNum}`,
        literalType.long
      );
    }
    if (!numParse.endsWith("L")) {
      return new LoadConstantInstruction(instr.dest, numParse, literalType.int);
    }
    return new LoadConstantInstruction(
      instr.dest,
      this.castLongToInt(numParse),
      literalType.int
    );

    //for turning long into int we gotta be careful cause of overflow
  }
  private simpleSimplifyBinExpr(instr: BinOpInstruction): Instruction {
    let instrUsed: Instruction = instr;
    switch (instr.binOp.toString()) {
      case "+":
        if (instr.expr1 === "0" || instr.expr1 === "0L") {
          instrUsed = new CopyInstruction(instr.dest, instr.expr2);
          break;
        }
        if (instr.expr2 === "0" || instr.expr2 === "0L") {
          instrUsed = new CopyInstruction(instr.dest, instr.expr1);
          break;
        }
        break;
      case "-":
        if (instr.expr2 === "0" || instr.expr2 === "0L") {
          instrUsed = new CopyInstruction(instr.dest, instr.expr1);
          break;
        }
        break;
      case "*":
        instrUsed = this.simpleSimplifyMul(instr);
        break;
      case "/":
        instrUsed = this.simpleSimplifyDiv(instr);
        break;
      case "%":
        instrUsed = this.simpleSimplifyMod(instr);
        break;
    }
    instrUsed.weight = instr.weight;
    return instr;
  }

  private simplifyBinExpr(instr: BinOpInstruction): Instruction[] {
    let instrUsed: Instruction[] = [instr];
    switch (instr.binOp.toString()) {
      case "+":
        if (instr.expr1 === "0" || instr.expr1 === "0L") {
          instrUsed = [new CopyInstruction(instr.dest, instr.expr2)];
          break;
        }
        if (instr.expr2 === "0" || instr.expr2 === "0L") {
          instrUsed = [new CopyInstruction(instr.dest, instr.expr1)];
          break;
        }
        break;
      case "-":
        if (instr.expr2 === "0" || instr.expr2 === "0L") {
          instrUsed = [new CopyInstruction(instr.dest, instr.expr1)];
          break;
        }
        break;
      case "*":
        instrUsed = [this.simplifyMul(instr)];
        break;
      case "/":
        instrUsed = this.simplifyDiv(instr);
        break;
      case "%":
        instrUsed = this.simplifyMod(instr);
        break;
    }
    instrUsed.forEach((i) => (i.weight = instr.weight));
    return instrUsed;
  }

  private simpleSimplifyMul(instr: BinOpInstruction): Instruction {
    if (instr.binOp.toString() !== "*") {
      throw new Error("something happened! Calling simplify mul on non mul op");
    }

    if (instr.expr1 === "0" || instr.expr2 === "0") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.int);
    }
    if (instr.expr1 === "0L" || instr.expr2 === "0L") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.long);
    }

    if (instr.expr1 === "1" || instr.expr1 === "1L") {
      return new CopyInstruction(instr.dest, instr.expr2);
    }
    if (instr.expr2 === "1" || instr.expr2 === "1L") {
      return new CopyInstruction(instr.dest, instr.expr1);
    }

    if (instr.expr1 === "-1") {
      return new BinOpInstruction("0", new MinusOp(), instr.expr2, instr.dest);
    }

    if (instr.expr1 === "-1L") {
      return new BinOpInstruction("0L", new MinusOp(), instr.expr2, instr.dest);
    }

    if (instr.expr2 === "-1") {
      return new BinOpInstruction("0", new MinusOp(), instr.expr1, instr.dest);
    }

    if (instr.expr2 === "-1L") {
      return new BinOpInstruction("0L", new MinusOp(), instr.expr1, instr.dest);
    }
    return instr;
  }

  private simplifyMul(instr: BinOpInstruction): Instruction {
    if (instr.binOp.toString() !== "*") {
      throw new Error("something happened! Calling simplify mul on non mul op");
    }

    if (instr.expr1 === "0" || instr.expr2 === "0") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.int);
    }
    if (instr.expr1 === "0L" || instr.expr2 === "0L") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.long);
    }

    if (instr.expr1 === "1" || instr.expr1 === "1L") {
      return new CopyInstruction(instr.dest, instr.expr2);
    }
    if (instr.expr2 === "1" || instr.expr2 === "1L") {
      return new CopyInstruction(instr.dest, instr.expr1);
    }

    if (instr.expr1 === "-1") {
      return new BinOpInstruction("0", new MinusOp(), instr.expr2, instr.dest);
    }

    if (instr.expr1 === "-1L") {
      return new BinOpInstruction("0L", new MinusOp(), instr.expr2, instr.dest);
    }

    if (instr.expr2 === "-1") {
      return new BinOpInstruction("0", new MinusOp(), instr.expr1, instr.dest);
    }

    if (instr.expr2 === "-1L") {
      return new BinOpInstruction("0L", new MinusOp(), instr.expr1, instr.dest);
    }

    const pow2First = getPowOf2(instr.expr1);
    const negPow2First = getNegPowOf2(instr.expr1);
    const pow2Second = getPowOf2(instr.expr2);
    const negPow2Second = getNegPowOf2(instr.expr2);

    if (pow2First !== null) {
      return new LeftShiftInstruction(
        instr.dest,
        instr.expr2,
        pow2First,
        false
      );
    }
    if (pow2Second !== null) {
      return new LeftShiftInstruction(
        instr.dest,
        instr.expr1,
        pow2Second,
        false
      );
    }
    if (negPow2First) {
      return new LeftShiftInstruction(
        instr.dest,
        instr.expr2,
        negPow2First,
        true
      );
    }
    if (negPow2Second) {
      return new LeftShiftInstruction(
        instr.dest,
        instr.expr1,
        negPow2Second,
        true
      );
    }
    return instr;
  }

  private simpleSimplifyDiv(instr: BinOpInstruction): Instruction {
    if (instr.binOp.toString() !== "/") {
      throw new Error("something happened! Calling simplify div on non div op");
    }
    if (instr.expr2 === "1" || instr.expr2 === "1L") {
      return new CopyInstruction(instr.dest, instr.expr1);
    }
    // todo add extra compiler hacks of multiplication in the future maybe of strength
    //reduction
    if (instr.expr1 === "0") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.int);
    }
    if (instr.expr1 === "0L") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.long);
    }

    return instr;
  }

  private simplifyDiv(instr: BinOpInstruction): Instruction[] {
    if (instr.binOp.toString() !== "/") {
      throw new Error("something happened! Calling simplify div on non div op");
    }
    if (instr.expr2 === "1" || instr.expr2 === "1L") {
      return [new CopyInstruction(instr.dest, instr.expr1)];
    }
    // todo add extra compiler hacks of multiplication in the future maybe of strength
    //reduction
    if (instr.expr1 === "0") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.int)];
    }
    if (instr.expr1 === "0L") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.long)];
    }

    if (instr.expr2 === "-1") {
      return [
        new BinOpInstruction("0", new MinusOp(), instr.expr1, instr.dest),
      ];
    }

    if (instr.expr2 === "-1") {
      return [
        new BinOpInstruction("0L", new MinusOp(), instr.expr1, instr.dest),
      ];
    }

    const pow2Second = getPowOf2(instr.expr2);
    const negPow2Second = getNegPowOf2(instr.expr2);

    if (pow2Second !== null) {
      return [
        new RightShiftInstruction(instr.dest, instr.expr1, pow2Second, false),
      ];
    }
    if (negPow2Second) {
      return [
        new RightShiftInstruction(instr.dest, instr.expr1, negPow2Second, true),
      ];
    }

    const number = safeExtractNum(instr.expr2);
    if (number === null || number.endsWith("L")) {
      return [instr];
    }
    const divNum = Number(number);
    const posNum = divNum >= 0 ? divNum : -divNum;
    const readRes = computeSignedMagic(posNum);
    if (
      readRes.magic === null ||
      readRes.shift === null ||
      readRes.add === null
    ) {
      return [instr];
    }
    const instrs: Instruction[] = [
      new MagicDivideInstruction(
        instr.dest,
        instr.expr1,
        readRes.magic,
        readRes.shift,
        readRes.add
      ),
    ];
    if (divNum < 0) {
      instrs.push(
        new BinOpInstruction("0", new MinusOp(), instr.dest, instr.dest)
      );
    }
    return instrs;
  }

  private simpleSimplifyMod(instr: BinOpInstruction): Instruction {
    if (instr.binOp.toString() !== "%") {
      throw new Error("something happened! Calling simplify div on non div op");
    }
    if (instr.expr2 === "1" || instr.expr2 === "-1") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.int);
    }
    if (instr.expr2 === "1L" || instr.expr2 === "-1L") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.long);
    }
    if (instr.expr1 === "0") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.int);
    }
    if (instr.expr1 === "0L") {
      return new LoadConstantInstruction(instr.dest, "0", literalType.long);
    }

    return instr;
  }

  private simplifyMod(instr: BinOpInstruction): Instruction[] {
    if (instr.binOp.toString() !== "%") {
      throw new Error("something happened! Calling simplify div on non div op");
    }
    if (instr.expr2 === "1" || instr.expr2 === "-1") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.int)];
    }
    if (instr.expr2 === "1L" || instr.expr2 === "-1L") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.long)];
    }
    if (instr.expr1 === "0") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.int)];
    }
    if (instr.expr1 === "0L") {
      return [new LoadConstantInstruction(instr.dest, "0", literalType.long)];
    }
    const pow2Second = getPowOf2(instr.expr2);
    const negPow2Second = getNegPowOf2(instr.expr2);
    if (pow2Second !== null) {
      return [new AndModInstruction(instr.dest, instr.expr1, instr.expr2)];
    }
    if (negPow2Second) {
      return [
        new AndModInstruction(instr.dest, instr.expr1, instr.expr2.slice(1)),
      ]; //in c a%b is the same as a%(-b)
    }

    let number = safeExtractNum(instr.expr2);
    if (number === null || number.endsWith("L")) {
      return [instr];
    }
    number = number.startsWith("-") ? number.slice(1) : number; //in c a%b is the same as a%(-b)
    const divNum = Number(number);
    const readRes = computeSignedMagic(divNum);
    if (
      readRes.magic === null ||
      readRes.shift === null ||
      readRes.add === null
    ) {
      return [instr];
    }
    // return [instr];
    const magicDiv = new MagicDivideInstruction(
      instr.dest,
      instr.expr1,
      readRes.magic,
      readRes.shift,
      readRes.add
    );
    const restoreDiv = new BinOpInstruction(
      instr.dest,
      new MultiplyOp(),
      instr.expr2,
      instr.dest
    );
    const subtractFloor = new BinOpInstruction(
      instr.expr1,
      new MinusOp(),
      instr.dest,
      instr.dest
    );
    return [magicDiv, restoreDiv, subtractFloor];
  }

  private constantFolding(blocks: Array<BasicBlock>): boolean {
    let changed = false;

    blocks.forEach((block) => {
      const originalInstructions = [...block.instructions];
      block.instructions = block.instructions.map((instr) => {
        const folded = foldInstr(instr);
        if (folded !== instr) {
          changed = true;
          return folded;
        }
        return instr;
      });

      // Check if instructions were changed
      if (block.instructions.length !== originalInstructions.length) {
        changed = true;
      } else {
        for (let i = 0; i < block.instructions.length; i++) {
          if (block.instructions[i] !== originalInstructions[i]) {
            changed = true;
            break;
          }
        }
      }
    });

    return changed;
  }
}
