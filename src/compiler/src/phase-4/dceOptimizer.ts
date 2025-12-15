import { ControlFlowGraph } from "../phase-3/cfg";
import {
  BasicBlock,
  CallInstruction,
  ReturnInstruction,
} from "../phase-3/cfgTypes";
import {
  safeParseBool,
  setDifference,
  setIntersection,
  setPop,
  setUnion,
} from "./utils";
import { DataFlowUtils } from "./dataflowUtils";
import { VoidType } from "../phase-2/semantics/datatype";

export class DceOptimizer {
  private isLocal: boolean = true;
  private dataflowUtils: DataFlowUtils = new DataFlowUtils();
  private killableMethods: Set<string> = new Set();

  constructor(
    private program: ControlFlowGraph,
    private localMethods: Set<string>
  ) { }

  public eliminateDeadCode(
    blocks: Array<BasicBlock>,
    methodName: string,
    maxTimes = 1
  ) {
    if (maxTimes === 0) {
      return;
    }
    // Implement dead code elimination logic
    blocks.forEach((block) => {
      block.in = new Set();
      block.out = new Set();
      if (block.branchSuccessors) {
        const boolExtracteced = safeParseBool(
          block.branchSuccessors.conditionVar
        );
        if (boolExtracteced) {
          this.removeDeadBranch(block, boolExtracteced === "1");
        }
      }
    });

    const lastBlock = blocks[blocks.length - 1];
    this.cleanBlock(lastBlock);
    lastBlock.in = this.dataflowUtils.getUses(lastBlock);

    const changed: Set<BasicBlock> = new Set(
      blocks.filter((block) => block.label !== lastBlock.label)
    );

    while (changed.size > 0) {
      const block: BasicBlock = setPop(changed);

      const oldIn = block.in;

      block.out = new Set();
      block.getSuccessors().forEach((succ) => {
        block.out = setUnion(block.out, succ.in);
      });

      // IN[n] = use[n] union (out[n] - def[n])
      const uses = this.dataflowUtils.getUses(block);
      const rhs = setDifference(
        block.out,
        this.dataflowUtils.getVarDefinitions(block)
      );

      block.in = setUnion(uses, rhs);

      // Check if the IN set has changed
      if (
        setUnion(oldIn, block.in).size !== setIntersection(oldIn, block.in).size
      ) {
        block.getPredecessors().forEach((pred) => changed.add(pred));
      }
    }

    // Clean up blocks

    let eliminatedBlock = false;
    const methodIndex = this.program.orderedMethods.indexOf(methodName);
    this.isLocal = true;
    blocks.forEach((block) => {
      eliminatedBlock = this.cleanBlock(block) || eliminatedBlock;
    });
    if (this.isLocal) {
      this.localMethods.add(methodName);
      if (this.program.orderedDataTypes[methodIndex].equals(new VoidType())) {
        this.killableMethods.add(methodName);
      }
    }
    if (eliminatedBlock) {
      this.eliminateDeadCode(blocks, methodName, maxTimes - 1);
    }
  }

  private cleanBlock(block: BasicBlock, maxTimes = 10): boolean {
    // iterate backwards through statements in block
    // keep track of uses as we go backwards
    // if we find a definition, and it is not in uses AND its not in out, we remove definition
    // if we find a definition, and it is IN uses, remove from uses
    let earliestReturn: null | number = null;
    if (maxTimes === 0) {
      return false;
    }
    let hasChanged = false;
    let uses: Set<string> = new Set(block.out.values());
    const globals = this.program.getGlobals();
    if (block.branchSuccessors) {
      uses.add(block.branchSuccessors.conditionVar);
      this.dataflowUtils.addPotentialUse(
        uses,
        block.branchSuccessors.conditionVar
      );
    }
    const toDelete: Set<number> = new Set();
    block.instructions.reverse();
    block.instructions.forEach((instruction, index) => {
      if (instruction instanceof CallInstruction) {
        const isDeadMethod = this.isDeadMethod(instruction);
        if (isDeadMethod) {
          toDelete.add(index);
          hasChanged = true;
          return;
        }
        if (!this.isLocalMethod(instruction)) {
          this.isLocal = false;
        }
      }
      if (instruction instanceof ReturnInstruction) {
        earliestReturn = index;
      }
      const dest = instruction.getDest();
      const instructionUses =
        this.dataflowUtils.getInstructionUses(instruction);
      if (dest) {
        const splitName = dest.split(/\[|\]/)[0];
        this.isLocal = this.isLocal && !globals.has(splitName); //todo in future
        // remember can remove redeclared globals
        if (
          this.isRemovable(dest, uses) &&
          !(instruction instanceof CallInstruction)
        ) {
          toDelete.add(index);
          hasChanged = true;
        }
        uses.delete(dest);
      }

      if (!toDelete.has(index)) {
        uses = setUnion(uses, instructionUses);
      }
    });

    if (earliestReturn !== null) {
      // console.log("here\n");
      for (let i = 0; i < earliestReturn; i++) {
        toDelete.add(i);
        hasChanged = true;
      }
      this.removeBlockSuccessors(block);
    }

    // Remove instructions marked for deletion
    block.instructions = block.instructions
      .filter((instr, index) => {
        // if (toDelete.has(index)) {
        //   console.log("deleted instr :", instr);
        // }
        return !toDelete.has(index);
      })
      .reverse();
    if (hasChanged) {
      this.cleanBlock(block, maxTimes - 1);
      return true;
    }
    return false;
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
  private removeDeadBranch(block: BasicBlock, keepTrueBlock: boolean): boolean {
    const deleteBlock = !keepTrueBlock
      ? (block.branchSuccessors?.trueBlock as BasicBlock)
      : (block.branchSuccessors?.falseBlock as BasicBlock);

    const remainingBlock = !keepTrueBlock
      ? (block.branchSuccessors?.falseBlock as BasicBlock)
      : (block.branchSuccessors?.trueBlock as BasicBlock);

    this.program.addBlockSuccessor(block, remainingBlock);
    deleteBlock.popPredecessor(block);
    if (deleteBlock.getPredecessors().length === 0) {
      this.removeBlockSuccessors(deleteBlock);
    }
    block.branchSuccessors = null;
    return true;
  }

  private isRemovable(dest: string, curentUses: Set<string>): boolean {
    const globals = this.program.getGlobals();
    const splitName = dest.split(/\[|\]/)[0];
    return (
      !curentUses.has(dest) && splitName === dest && !globals.has(splitName)
    );
  }

  private isLocalMethod(instruction: CallInstruction): boolean {
    return this.localMethods.has(instruction.methodName);
  }
  private isDeadMethod(instruction: CallInstruction): boolean {
    return this.killableMethods.has(instruction.methodName);
  }
}
