import { ControlFlowGraph } from "../phase-3/cfg";
import {
  BasicBlock,
  BinOpInstruction,
  CopyInstruction,
  Instruction,
  literalType,
  LoadConstantInstruction,
} from "../phase-3/cfgTypes";
import {
  foldInstr,
  safeExtractNum,
  setPop,
  setSample,
  setUnion,
  isArrayVariable,
} from "./utils";
import { DataFlowUtils, DefContainer } from "./dataflowUtils";

class InstructionMetadata {
  public constructor(
    public instr: Instruction,
    public isReplaceable: boolean
  ) { }
}

export class CpOptimizer {
  private dataflowUtils: DataFlowUtils = new DataFlowUtils();

  constructor(private program: ControlFlowGraph) { }

  public propagateConstants(
    blocks: Array<BasicBlock>,
    methodName: string,
    maxTimes = 10
  ) {
    if (maxTimes === 0) {
      return;
    }
    blocks.forEach((block) => {
      block.cpIn = new Set();
      block.cpOut = new Set();
    });

    const firstBlock = blocks[0];
    firstBlock.cpIn = new Set();
    firstBlock.cpOut = this.dataflowUtils.getDefinitionExprs(firstBlock);

    const changed: Set<BasicBlock> = new Set(
      blocks.filter((block) => block.label !== firstBlock.label)
    );

    while (changed.size > 0) {
      const block: BasicBlock = setPop(changed);

      const oldOut = block.cpOut;
      block.cpIn = new Set();
      block.getPredecessors().forEach((pred) => {
        block.cpIn = setUnion(block.cpIn, pred.cpOut);
      });

      // OUT[n] = GEN[n] U (IN[n] - KILL[n]);
      const newDefs = this.dataflowUtils.getDefinitionExprs(block);
      const survivingInDefs = this.dataflowUtils.getSurvivingDefinitions(
        block.cpIn,
        block
      );

      this.disableOldReassignments(survivingInDefs, newDefs);

      block.cpOut = setUnion(newDefs, survivingInDefs);

      // Check if the IN set has changed
      if (setUnion(oldOut, block.cpOut).size !== oldOut.size) {
        block.getSuccessors().forEach((succ) => changed.add(succ));
      }
    }

    // Clean up blocks
    let copiedExpr = false;
    blocks.forEach((block) => {
      copiedExpr = this.cleanBlock(block) || copiedExpr;
    });

    if (copiedExpr) {
      this.propagateConstants(blocks, methodName, maxTimes - 1);
    }
  }

  private disableOldReassignments(
    oldDefs: Set<DefContainer>,
    newDefs: Set<DefContainer>
  ) {
    const relabeledDefs = new Set([...newDefs].map((def) => def.dest));
    oldDefs.forEach((def) => {
      const srcs = def.exprSrc.getSrcs();
      srcs.forEach((src) => {
        if (relabeledDefs.has(src)) {
          def.isReplaceable = false;
        }
      });
    });
  }

  private removeArrayStatements(replaceMap: Map<string, string>) {
    [...replaceMap.keys()].forEach((key) => {
      if (
        isArrayVariable(key) ||
        isArrayVariable(replaceMap.get(key) as string)
      ) {
        replaceMap.delete(key);
      }
    });
  }
  private isGlobalVariable(key: string): boolean {
    return this.program.getGlobals().has(key);
  }

  private removeGlobalStatements(replaceMap: Map<string, string>) {
    const globals = this.program.getGlobals();
    [...replaceMap.keys()].forEach((key) => {
      if (globals.has(key)) {
        replaceMap.delete(key);
      }
    });
  }

  private cleanBlock(block: BasicBlock, maxTimes = 1): boolean {
    // iterate through the block in forwads order,
    // iterrating through the variables in each statement. If the variable has a single
    // reaching definiton and it is constant we replace the variable with the constant
    // todo extend to actual copy of variables once trick is found
    if (maxTimes === 0) return false;
    let hasChanged = false;
    const reachingDefMap: Map<string, Set<InstructionMetadata>> = new Map();
    const replaceMap: Map<string, string> = new Map();

    block.cpIn.forEach((def) => {
      reachingDefMap.set(def.dest, new Set());
    });

    block.cpIn.forEach((def) => {
      const metadata = new InstructionMetadata(def.exprSrc, def.isReplaceable);
      reachingDefMap.get(def.dest)?.add(metadata);
    });

    reachingDefMap.forEach((value, key) => {
      if (value.size === 1) {
        const instructionMd = setSample(value);
        const instruction = instructionMd.instr;
        const isReplaceable = instructionMd.isReplaceable;

        if (instruction instanceof LoadConstantInstruction) {
          replaceMap.set(key, instruction.getNumericRep());
        }
        if (instruction instanceof CopyInstruction && isReplaceable) {
          replaceMap.set(key, instruction.src);
        }
      }
    });

    this.removeArrayStatements(replaceMap);
    this.removeGlobalStatements(replaceMap);

    const killers: Map<string, string[]> = new Map();
    block.instructions.forEach((instruction) => {
      hasChanged = instruction.replaceSrcs(replaceMap) || hasChanged;
      const dest = instruction.getDest();
      if (dest && !this.isGlobalVariable(dest) && !isArrayVariable(dest)) {
        replaceMap.delete(dest);
        if (instruction instanceof LoadConstantInstruction) {
          if (safeExtractNum(instruction.getNumericRep()) !== null) {
            replaceMap.set(dest, instruction.getNumericRep());
          }
        }
        if (instruction instanceof CopyInstruction) {
          const src = instruction.src;
          if (!isArrayVariable(src)) {
            replaceMap.set(dest, src);
          }
          if (!killers.has(src)) {
            killers.set(src, []);
          }
          killers.get(src)?.push(dest);
        }
        if (instruction instanceof BinOpInstruction) {
          if (!killers.has(instruction.expr1)) {
            killers.set(instruction.expr1, []);
          }
          if (!killers.has(instruction.expr2)) {
            killers.set(instruction.expr2, []);
          }
          killers.get(instruction.expr1)?.push(dest);
          killers.get(instruction.expr2)?.push(dest);
          const outputInstr = foldInstr(instruction);
          if (outputInstr instanceof CopyInstruction) {
            replaceMap.set(dest, outputInstr.src);
          }
        }
        killers.get(dest)?.forEach((killer) => {
          replaceMap.delete(killer);
        });
      }
    });
    this.replaceCopies(block);

    if (block.branchSuccessors) {
      const conditionVar = block.branchSuccessors.conditionVar;
      if (replaceMap.has(conditionVar)) {
        block.branchSuccessors.conditionVar = replaceMap.get(
          conditionVar
        ) as string;
      }
    }
    if (hasChanged) {
      this.cleanBlock(block, 0);
      return true;
    }
    return false;
  }

  private replaceCopies(block: BasicBlock) {
    block.instructions = block.instructions.map((instruction) => {
      if (instruction instanceof CopyInstruction) {
        const extractedNum = safeExtractNum(instruction.src);
        if (extractedNum !== null) {
          const numType = extractedNum.includes("b")
            ? literalType.bool
            : extractedNum.includes("L")
              ? literalType.long
              : literalType.int;
          const numUsed =
            numType === literalType.int
              ? instruction.src
              : instruction.src.slice(0, -1);
          return new LoadConstantInstruction(
            instruction.dest,
            numUsed,
            numType
          );
        }
      }
      return instruction;
    });
  }
  private removeBlockSuccessors(deleteBlock: BasicBlock) {
    deleteBlock.getSuccessors().forEach((succ) => {
      succ.popPredecessor(deleteBlock);
      if (succ.getPredecessors().length === 0) {
        this.removeBlockSuccessors(succ);
      }
    });
    deleteBlock.joinSuccessor = null;
    deleteBlock.branchSuccessors = null;
  }
}
