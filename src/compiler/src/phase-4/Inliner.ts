import {
  BasicBlock,
  CallInstruction,
  CopyInstruction,
  LabelInstruction,
  ReturnInstruction,
  CreateArrayInstruction,
  CreateVarInstruction,
} from "../phase-3/cfgTypes";
import { ControlFlowGraph } from "../phase-3/cfg";

export class Inliner {
  private usableMethods: Map<string, BasicBlock> = new Map();
  private inlineCounter = 0;
  private voidReturns: Set<string> = new Set();

  public constructor(private program: ControlFlowGraph) { }

  public inlinesMethod(methodName: string): boolean {
    return this.usableMethods.has(methodName);
  }

  public addMethod(firstBlock: BasicBlock, isVoidReturn: boolean): void {
    if (isVoidReturn) {
      this.voidReturns.add(firstBlock.label);
    }

    if (this.couldFallOff(firstBlock, isVoidReturn, new Set())) {
      return;
    }

    const firstInstr = firstBlock.instructions[0];
    this.removeSuccsAfterReturn(firstBlock, new Set());

    if (!(firstInstr instanceof LabelInstruction)) {
      throw new Error("First instruction is not label instruction");
    }
    const methodName = firstInstr.label;
    this.usableMethods.set(
      methodName,
      this.recursiveDupBlock(firstBlock, new Map())
    );
  }

  private couldFallOff(
    block: BasicBlock,
    isVoidReturn: boolean,
    visited: Set<string>
  ): boolean {
    if (isVoidReturn) {
      return false;
    }
    if (visited.has(block.label)) {
      return false;
    }
    visited.add(block.label);
    const succs = block.getSuccessors();

    if (succs.length === 0) {
      return !(
        block.instructions[block.instructions.length - 1] instanceof
        ReturnInstruction
      );
    }

    for (const succ of succs) {
      if (this.couldFallOff(succ, isVoidReturn, visited)) {
        return true;
      }
    }
    return false;
  }

  //we don't want to inline big functions, so we just count the number of instructions capped at the inline limit
  private instrCounter(
    methodBlock: BasicBlock,
    inlineCap: number,
    visited: Set<string>
  ): number {
    if (visited.has(methodBlock.label)) {
      return 0;
    }
    visited.add(methodBlock.label);
    let counter = 0;
    counter += methodBlock.instructions.length;
    for (const succ of methodBlock.getSuccessors()) {
      if (counter >= inlineCap) {
        return counter;
      }
      counter += this.instrCounter(succ, inlineCap - counter, visited);
    }
    return counter;
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

  private removeSuccsAfterReturn(
    block: BasicBlock,
    visited: Set<string>
  ): void {
    if (visited.has(block.label)) {
      return;
    }
    const blockSuccs = block.getSuccessors();
    visited.add(block.label);
    const lastInstr = block.instructions[block.instructions.length - 1];
    if (lastInstr instanceof ReturnInstruction) {
      block.getSuccessors().forEach((succ) => {
        succ.popPredecessor(block);
        if (succ.getPredecessors().length === 0) {
          this.removeBlockSuccessors(succ);
        }
        block.joinSuccessor = null;
        block.branchSuccessors = null;
      });
    }
    blockSuccs.forEach((succ) => {
      this.removeSuccsAfterReturn(succ, visited);
    });
  }

  public inlineAll(methodBlock: BasicBlock, curMethodName: string): void {
    const allCurBlocks = this.getAllBlocks(methodBlock, new Set());
    // allCurBlocks.forEach((block) => {
    //   changed = changed || this.inlineBlock(block, curMethodName);

    // });
    for (const block of allCurBlocks) {
      this.inlineBlock(block, curMethodName);
    }

    const inlineCap = 40;
    this.fixProblems(methodBlock, new Set());
    const instrCount = this.instrCounter(methodBlock, inlineCap, new Set());
    if (instrCount >= inlineCap) {
      this.usableMethods.delete(curMethodName);
    }
    // console.log("Done inlining");
  }

  private fixProblems(curBlock: BasicBlock, visited: Set<string>): void {
    if (visited.has(curBlock.label)) {
      return;
    }

    visited.add(curBlock.label);
    curBlock.mutPredecessors.clear();
    curBlock.mutPredecessorBlocks.forEach((block) => {
      curBlock.mutPredecessors.add(block.label);
    });

    curBlock.getSuccessors().forEach((succ) => {
      this.fixProblems(succ, visited);
    });
  }

  private getAllBlocks(block: BasicBlock, visited: Set<string>): BasicBlock[] {
    if (visited.has(block.label)) {
      return [];
    }
    visited.add(block.label);
    const blocks: BasicBlock[] = [block];
    block.getSuccessors().forEach((succ) => {
      blocks.push(...this.getAllBlocks(succ, visited));
    });
    return blocks;
  }

  public inlineBlock(curBlock: BasicBlock, curMethodName: string): void {
    let changed = true;
    while (changed) {
      changed = false;
      curBlock.instructions.forEach((instr, instrIndex) => {
        if (changed) {
          return;
        }
        if (!(instr instanceof CallInstruction)) {
          return;
        }
        if (instr.methodName === curMethodName) {
          this.usableMethods.delete(instr.methodName);

          return;
        }
        if (!this.usableMethods.has(instr.methodName)) {
          return;
        }
        // const newBlock = this.createNewInlineBlock(instr.methodName);
        const followingInstrs = curBlock.instructions.slice(instrIndex + 1);
        const followerBlock = new BasicBlock(
          `follower_${this.inlineCounter++}`,
          curBlock.curScope,
          curBlock.parentScope,
          followingInstrs
        );
        followerBlock.joinSuccessor = curBlock.joinSuccessor;
        followerBlock.branchSuccessors = curBlock.branchSuccessors;
        followerBlock.getSuccessors().forEach((succ) => {
          this.updateBlockDependencies(curBlock, followerBlock, succ);
        });

        const inlineBlock = this.createNewInlineBlock(
          instr.methodName,
          instr.args as Array<string> // inline functions don't have str literals as args
        );
        const returnVar =
          instr.returnVar === undefined ? null : instr.returnVar;
        this.addJoinSuccesor(curBlock, inlineBlock);
        this.addBlockToEndPoints(
          inlineBlock,
          followerBlock,
          returnVar,
          instr.methodName,
          new Set()
        );

        curBlock.instructions = curBlock.instructions.slice(0, instrIndex);
        changed = true;
        curBlock.branchSuccessors = null;
        curBlock = followerBlock; // now we try to keep inlining on the follower block
      });
    }
  }

  private addBlockToEndPoints(
    block: BasicBlock,
    newTerm: BasicBlock,
    returnVar: string | null,
    methodName: string,
    visited: Set<string>
  ): void {
    if (visited.has(block.label)) {
      return;
    }
    const isVoidReturn = this.voidReturns.has(methodName);
    visited.add(block.label);
    block.getSuccessors().forEach((succ) => {
      this.addBlockToEndPoints(succ, newTerm, returnVar, methodName, visited);
    });
    const lastInstr = block.instructions[block.instructions.length - 1];

    if (
      block.getSuccessors().length === 0 &&
      (isVoidReturn || lastInstr instanceof ReturnInstruction)
    ) {
      this.addJoinSuccesor(block, newTerm);
    }
    //return mustbe at the end if it exists I believe, though should double
    // check
    if (lastInstr instanceof ReturnInstruction) {
      block.instructions.pop();
      if (returnVar !== null && lastInstr.src !== null) {
        block.instructions.push(new CopyInstruction(returnVar, lastInstr.src));
      }
    }
  }

  private createNewInlineBlock(
    methodName: string,
    params: Array<string>
  ): BasicBlock {
    if (!this.usableMethods.has(methodName)) {
      throw new Error("trying to duplicate cfg that doesn't exist");
    }
    const firstBlock = this.usableMethods.get(methodName) as BasicBlock;
    const dupBlock = this.recursiveDupBlock(firstBlock, new Map());
    dupBlock.mutPredecessorBlocks = []; // still have the fake predecesor block
    dupBlock.mutPredecessors.clear();

    this.prefixBlockVariables(
      dupBlock,
      `${this.inlineCounter}_${methodName}`,
      new Set()
    );
    let startIdx = 0;
    let curInstr = dupBlock.instructions[startIdx];
    while (
      curInstr instanceof LabelInstruction ||
      curInstr instanceof CreateArrayInstruction ||
      curInstr instanceof CreateVarInstruction
    ) {
      startIdx++;
      curInstr = dupBlock.instructions[startIdx];
    }

    for (let i = 0; i < params.length; i++) {
      const curInstr = dupBlock.instructions[i + startIdx];
      if (
        curInstr instanceof LabelInstruction ||
        curInstr instanceof CreateArrayInstruction ||
        curInstr instanceof CreateVarInstruction
      ) {
        continue;
      }
      if (!(curInstr instanceof CopyInstruction)) {
        throw new Error("instruction should be copying function params");
      }
      dupBlock.instructions[i + startIdx] = new CopyInstruction(
        curInstr.dest,
        params[i]
      );
    }
    this.recusivelyModifyLabels(dupBlock, new Set());
    return dupBlock;
  }

  private prefixBlockVariables(
    block: BasicBlock,
    methodName: string,
    visited: Set<string>
  ): void {
    if (visited.has(block.label)) {
      return;
    }
    visited.add(block.label);
    block.instructions.forEach((instr) => {
      instr.addMethodNameToVarName(methodName, this.program);
    });
    if (
      block.branchSuccessors !== null &&
      !this.program.isGlobalVariable(block.branchSuccessors.conditionVar)
    ) {
      block.branchSuccessors.conditionVar =
        methodName + "_" + block.branchSuccessors.conditionVar;
    }
    block.getSuccessors().forEach((succ) => {
      this.prefixBlockVariables(succ, methodName, visited);
    });
  }

  private recusivelyModifyLabels(
    curBlock: BasicBlock,
    blocksModified: Set<string>
  ) {
    if (blocksModified.has(curBlock.label)) {
      return;
    }
    curBlock.label = `${curBlock.label}_${this.inlineCounter}`;
    const labelInstr = curBlock.instructions[0];
    if (!(labelInstr instanceof LabelInstruction)) {
      throw new Error("First instruction is not label instruction");
    }
    labelInstr.label = curBlock.label;
    blocksModified.add(curBlock.label);
    curBlock.getSuccessors().forEach((succ) => {
      this.recusivelyModifyLabels(succ, blocksModified);
    });

    //now mut predecessor's labels may be out of date

    curBlock.mutPredecessors = new Set(
      curBlock.mutPredecessorBlocks.map((block) => block.label)
    );
  }

  private recursiveDupBlock(
    curBlock: BasicBlock,
    dupMap: Map<string, BasicBlock> // map from label to duplicate block)
  ): BasicBlock {
    if (dupMap.has(curBlock.label)) {
      return dupMap.get(curBlock.label) as BasicBlock;
    }
    const dupBlock = curBlock.duplicate();
    dupMap.set(dupBlock.label, dupBlock);

    dupBlock.getSuccessors().forEach((succ) => {
      const dupSuc = this.recursiveDupBlock(succ, dupMap);
      this.updateBlockDependencies(curBlock, dupBlock, dupSuc);
    });

    return dupBlock;
  }

  private updateBlockDependencies(
    oldBlock: BasicBlock,
    newBlock: BasicBlock,
    dependencyBlock: BasicBlock
  ): void {
    if (oldBlock === newBlock) {
      throw new Error("oldBlock and newBlock are the same");
    }
    dependencyBlock.mutPredecessorBlocks =
      dependencyBlock.mutPredecessorBlocks.map((block) => {
        if (block.label === oldBlock.label) {
          dependencyBlock.mutPredecessors.delete(block.label);
          dependencyBlock.mutPredecessors.add(newBlock.label);
          dependencyBlock.mutPredecessorBlocks =
            dependencyBlock.mutPredecessorBlocks.map((block) => {
              if (block.label === oldBlock.label) {
                return newBlock;
              }
              return block;
            });
          dependencyBlock.mutPredecessorBlocks.push(newBlock);
          return newBlock;
        }
        return block;
      });
    if (newBlock.branchSuccessors) {
      const branches = newBlock.branchSuccessors;
      if (branches.trueBlock.label === dependencyBlock.label) {
        branches.trueBlock = dependencyBlock;
        return;
      }

      if (branches.falseBlock.label === dependencyBlock.label) {
        branches.falseBlock = dependencyBlock;
        return;
      }
      throw new Error("dependency block is not a branch successor");
    }

    if (newBlock.joinSuccessor) {
      newBlock.joinSuccessor = dependencyBlock;
    }
  }

  private addJoinSuccesor(block: BasicBlock, succ: BasicBlock): void {
    block.joinSuccessor = succ;
    succ.mutPredecessorBlocks.push(block);
    succ.mutPredecessors.add(block.label);
  }
}
