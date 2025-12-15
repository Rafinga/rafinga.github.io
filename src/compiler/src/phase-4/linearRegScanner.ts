import { BasicBlock, Instruction, isConstantStr } from "../phase-3/cfgTypes";
import { ControlFlowGraph } from "../phase-3/cfg";
import { isArrayVariable, setUnion, setPop, getSplitName } from "./utils";
import {
  LongCallerSavedReg,
  LongCalleeSavedReg,
  LoadRegInstruction,
  LongReg,
} from "../phase-3/RegTypes";
import { isBooleanObject } from "util/types";

export class ReverseCfg {
  public nodes: Array<Array<BasicBlock>> = [];

  constructor(
    private optimizedCfg: Array<BasicBlock>,
    private cfg: ControlFlowGraph
  ) {
    this.optimizedCfg.forEach((block) => {
      this.nodes.push(this.buildMethodNodes(block));
    });
  }

  // protected buildMethodNodes(method: BasicBlock): Array<BasicBlock> {
  //   // reverse post-order traversal
  //   const nodes: Array<BasicBlock> = [];
  //   const visited: Set<string> = new Set();

  //   function dfs(block: BasicBlock) {
  //     if (visited.has(block.label)) {
  //       return;
  //     }
  //     visited.add(block.label);

  //     for (const succ of block.getSuccessors()) {
  //       if (!visited.has(succ.label)) {
  //         dfs(succ);
  //       }
  //     }

  //     nodes.push(block);
  //   }

  //   dfs(method);

  //   return nodes.reverse();
  // }

  protected buildMethodNodes(
    method: BasicBlock,
    nodes: Array<BasicBlock> = [],
    visited: Set<string> = new Set()
  ): Array<BasicBlock> {
    const relevantPredecessors = method.getPredecessors().filter((pred) => {
      return !pred.label.startsWith("skip_");
    });
    for (const pred of relevantPredecessors) {
      if (!visited.has(pred.label)) {
        return nodes;
      }
    }

    visited.add(method.label);
    nodes.push(method);
    if (method.label.startsWith("skip_")) {
      return nodes;
    }
    method.getSuccessors().forEach((succ) => {
      this.buildMethodNodes(succ, nodes, visited);
    });
    return nodes;
  }

  public isGlobalVariable(key: string): boolean {
    return this.cfg.getGlobals().has(key);
  }
}

export class Interval {
  public varName: string;
  public uses: Array<number>;
  private static counter = 0;
  public id: number;

  constructor(varName: string, uses: Array<number>) {
    this.varName = varName;
    this.uses = uses;
    this.id = Interval.counter++;
  }

  public addUse(use: number) {
    this.uses.push(use);
  }

  public getStart(): number {
    return this.uses[0];
  }

  public getEnd(): number {
    return this.uses[this.uses.length - 1];
  }
}

export class MethodLinearScanner {
  private intervals: Map<string, Interval> = new Map();
  private numRegs: number;
  private callerSavedRegs: Set<LongReg> = new Set(
    Object.values(LongCallerSavedReg)
  );
  private calleeSavedRegs: Set<LongReg> = new Set(
    Object.values(LongCalleeSavedReg)
  );
  private loadInstructions: Set<LoadRegInstruction> = new Set();
  // private availableRegs: Set<LongReg> = setUnion(
  //   this.callerSavedRegs,
  //   this.calleeSavedRegs
  // );
  private availableRegs: Set<LongReg> = new Set(
    [...setUnion(this.callerSavedRegs, this.calleeSavedRegs)]
    // .slice(0, 1)
  );
  private active: Array<Interval> = [];
  private registers: Map<number, LongReg> = new Map();
  private survivingIntervals: Array<Interval> = [];

  constructor(
    private reverseMethodBasicBlocks: Array<BasicBlock>,
    private reverseCfg: ReverseCfg
  ) {
    this.numRegs = this.availableRegs.size;
    let ctr = 0;
    this.reverseMethodBasicBlocks.forEach((block) => {
      this.buildIntervals(block, ctr);
      ctr += block.instructions.length;
    });
  }

  private assignable(varName: string): boolean {
    return (
      !this.reverseCfg.isGlobalVariable(varName) && !isConstantStr(varName)
    );
  }

  protected buildIntervals(block: BasicBlock, ctr: number): void {
    block.instructions.forEach((instr, index) => {
      const usedVariables = instr.getSrcs().map((src) => getSplitName(src));
      const posDest = instr.getDest();
      if (posDest !== null) {
        usedVariables.push(getSplitName(posDest));
      }
      usedVariables
        .filter((src) => this.assignable(src))
        .forEach((varName) => {
          if (!this.intervals.has(varName)) {
            this.intervals.set(varName, new Interval(varName, []));
          }
          this.intervals.get(varName)?.addUse(ctr + index);
        });
    });

    if (block.branchSuccessors !== null) {
      const branchVar = block.branchSuccessors.conditionVar;

      if (!this.intervals.has(branchVar)) {
        this.intervals.set(branchVar, new Interval(branchVar, []));
      }

      this.intervals
        .get(branchVar)
        ?.addUse(ctr + block.instructions.length + 0.5);
    }

    //for skip block gotta re-add branch variable to ensure it doesn't get overriden
    if (block.label.startsWith("skip_")) {
      const sucs = block.getSuccessors();
      if (sucs.length !== 1) {
        throw new Error("skip block should only have 1 successor");
      }

      const conditionVars = this.pullLoopConditionVars(sucs[0]);

      conditionVars.forEach((varName) => {
        if (!this.intervals.has(varName)) {
          this.intervals.set(varName, new Interval(varName, []));
        }
        this.intervals.get(varName)?.addUse(ctr + block.instructions.length);
      });
    }
  }

  private isLoopStatementStart(label: string): boolean {
    return (
      label.startsWith("skip") ||
      // label.startsWith("whileT") ||
      label.startsWith("forF") ||
      label.startsWith("whileF")
    );
  }

  private pullLoopConditionVars(curBlock: BasicBlock): Set<string> {
    let useSet: Set<string> = new Set();
    if (this.isLoopStatementStart(curBlock.label)) {
      return useSet;
    }
    curBlock.instructions.forEach((instr) => {
      const srcs = instr.getSrcs();
      const dest = instr.getDest();
      if (dest !== null) {
        srcs.push(dest);
      }

      srcs
        .map((src) => getSplitName(src))
        .filter((src) => this.assignable(src))
        .forEach((src) => useSet.add(src));
    });
    if (curBlock.branchSuccessors !== null) {
      useSet.add(curBlock.branchSuccessors.conditionVar);
    }
    curBlock.getSuccessors().forEach((succ) => {
      useSet = setUnion(useSet, this.pullLoopConditionVars(succ));
    });
    return useSet;
  }

  public allocateRegisters() {
    const sortedIntervals = Array.from(this.intervals.values()).sort(
      (a, b) => a.uses[0] - b.uses[0]
    );

    sortedIntervals.forEach((interval) => {
      this.expireOldIntervals(interval);
      if (this.active.length === this.numRegs) {
        this.spillAtInterval(interval);
      } else {
        // register[i] = register removed from pool of free registers
        this.setRegister(
          interval,
          setPop(this.availableRegs),
          interval.getStart()
        );
        this.active.push(interval);
        this.active.sort((a, b) => a.getEnd() - b.getEnd());
      }
    });

    this.insertLoadRegInstructions();
  }

  private expireOldIntervals(interval: Interval) {
    this.active.sort((a, b) => a.getEnd() - b.getEnd());
    const expiredIntervals = [];

    for (let i = 0; i < this.active.length; i++) {
      const iterInterval = this.active[i];
      if (iterInterval.getEnd() >= interval.getStart()) {
        break;
      }
      expiredIntervals.push(i);
      this.availableRegs.add(this.registers.get(iterInterval.id) as LongReg);
    }

    // Remove from the end to avoid index shifting issues
    for (let i = expiredIntervals.length - 1; i >= 0; i--) {
      const removedInterval = this.active.splice(expiredIntervals[i], 1);
      this.survivingIntervals.push(removedInterval[0]);
    }
  }

  private spillAtInterval(interval: Interval) {
    const spilledInterval = this.active[this.active.length - 1];

    if (spilledInterval.getEnd() > interval.getEnd()) {
      // Take register from the spilled interval and assign to current interval
      this.setRegister(
        interval,
        this.registers.get(spilledInterval.id) as LongReg,
        interval.getStart()
      );

      // Remove spilled interval from active list
      this.active.pop();

      // Add current interval to active list
      this.active.push(interval);
      this.active.sort((a, b) => a.getEnd() - b.getEnd());
    } else {
      // Current interval gets spilled to stack
      // Note: Stack locations happen automatically (?)
    }
  }

  private setRegister(interval: Interval, register: LongReg, lineNum: number) {
    this.registers.set(interval.id, register);
    this.loadInstructions.add(
      new LoadRegInstruction(interval.varName, register, lineNum)
    );
  }

  private insertLoadRegInstructions() {
    const sortedLoadInstructions = Array.from(this.loadInstructions).sort(
      (a, b) => a.lineNum - b.lineNum
    );

    const activeVars = new Set(
      [...this.survivingIntervals, ...this.active].map(
        (interval) => interval.varName
      )
    );
    const instrsToUse = sortedLoadInstructions.filter((instr) => {
      return activeVars.has(instr.varName);
    });

    const firstBlock = this.reverseMethodBasicBlocks[0];
    const label = firstBlock.instructions.shift() as Instruction;
    firstBlock.instructions = [
      label,
      ...instrsToUse,
      ...firstBlock.instructions,
    ];
  }

  // let currentIdx = 0;
  // this.reverseMethodBasicBlocks.forEach((block) => {
  //   const relevantInstructions = [...this.loadInstructions].filter(
  //     (instr) => {
  //       return (
  //         instr.lineNum >= currentIdx &&
  //         instr.lineNum < currentIdx + block.instructions.length
  //       );
  //     }
  //   );

  //   relevantInstructions.sort((a, b) => a.lineNum - b.lineNum);

  //   let instructionsAdded = 0;
  //   relevantInstructions.forEach((instr) => {
  //     block.instructions.splice(
  //       instr.lineNum - currentIdx + instructionsAdded,
  //       0,
  //       instr
  //     );
  //     instructionsAdded++;
  //   });

  //   currentIdx += block.instructions.length - instructionsAdded;
  // });
}
// }

export class ProgramLinearScanner {
  private reverseCfg: ReverseCfg;

  constructor(optimizedCfg: Array<BasicBlock>, cfg: ControlFlowGraph) {
    this.reverseCfg = new ReverseCfg(optimizedCfg, cfg);
  }

  public allocateRegisters() {
    this.reverseCfg.nodes.forEach((methodBlocks) => {
      const methodScanner = new MethodLinearScanner(
        methodBlocks,
        this.reverseCfg
      );
      methodScanner.allocateRegisters();
    });
  }
}
