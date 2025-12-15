import {
  BasicBlock,
  CallInstruction,
  Instruction,
  LabelInstruction,
} from "../phase-3/cfgTypes";
import {
  getSplitName,
  isArrayVariable,
  setDifference,
  setPop,
  setUnion,
  strictSetIntersection,
  strictSetUnion,
} from "./utils";
import {
  LongCallerSavedReg,
  LongReg,
  ReservedLongReg,
  getLongCalleeSavedRegs,
  getLongCallerSavedRegs,
  getLongRegs,
} from "../phase-3/RegTypes";
import { ControlFlowGraph } from "../phase-3/cfg";

export class Web {
  public liveRange: Set<Instruction> = new Set();
  public entry: Set<Instruction> = new Set();
  private rangeBuff: Set<Instruction> = new Set();
  private potRange: Set<Instruction> = new Set();

  constructor(public varName: string, entries: Array<Instruction>) {
    entries.forEach((instr) => {
      this.entry.add(instr);
    });
  }

  public clearPotRange(): void {
    this.potRange.clear();
  }

  private isLoopingLabel(instr: Instruction): boolean {
    if (instr instanceof LabelInstruction) {
      const labelName = instr.label;
      return labelName.startsWith("for") || labelName.startsWith("while");
    }
    return false;
  }

  public isLastUse(curInstr: Instruction): boolean {
    const range = [...this.liveRange];
    return range[range.length - 1] === curInstr;
  }

  public interferesWith(web: Web): boolean {
    const potOveralp1 = strictSetIntersection(this.potRange, web.liveRange);
    const potOveralp2 = strictSetIntersection(web.potRange, this.liveRange);
    const potOveralp3 = strictSetIntersection(this.entry, web.entry);
    if (this.varName === web.varName && potOveralp1.size > 0) {
      this.completePotFlush();
    }
    if (this.varName === web.varName && potOveralp2.size > 0) {
      web.completePotFlush();
    }
    const overlapSet = strictSetIntersection(this.liveRange, web.liveRange);
    if (overlapSet.size > 0) {
      return true;
    }
    if (potOveralp3.size > 0) {
      return true;
    }

    if (potOveralp1.size > 0 && this.varName !== web.varName) {
      let interferes = false;
      potOveralp1.forEach((instr) => {
        if (this.isLoopingLabel(instr)) {
          interferes = true;
        }
      });
      if (interferes) {
        return true;
      }
    }

    if (potOveralp2.size > 0 && this.varName !== web.varName) {
      let interferes = false;
      potOveralp2.forEach((instr) => {
        if (this.isLoopingLabel(instr)) {
          interferes = true;
        }
      });
      if (interferes) {
        return true;
      }
    }
    return false;
  }

  public union(web: Web): boolean {
    if (this.varName !== web.varName || !this.interferesWith(web)) {
      return false;
    }

    this.entry = strictSetUnion(this.entry, web.entry);
    this.liveRange = strictSetUnion(this.liveRange, web.liveRange);
    this.potRange = strictSetUnion(this.potRange, web.potRange);
    this.entry = strictSetUnion(this.entry, web.entry);
    return true;
  }

  public add(newInstr: Instruction): Web | null {
    this.rangeBuff.add(newInstr);
    const uses = new Set(newInstr.getSrcs().map((src) => getSplitName(src)));
    const dest = newInstr.getDest();
    if (dest !== null) {
      const splitDest = getSplitName(dest);
      if (splitDest !== dest) {
        uses.add(splitDest);
      }
    }

    if (uses.has(this.varName)) {
      this.flush();
    }
    if (dest === this.varName) {
      const newWeb = new Web(this.varName, [newInstr]);
      return newWeb;
    }

    return null;
  }
  public flush(): void {
    this.liveRange = strictSetUnion(this.liveRange, this.rangeBuff);
    this.clear();
  }
  //moves range buff to potRange set as we don't know if these instructions will be part of the live range
  //or not
  public potentialFlush(): void {
    this.potRange = strictSetUnion(this.potRange, this.rangeBuff);
    this.clear();
  }
  public completePotFlush(): void {
    this.liveRange = strictSetUnion(this.liveRange, this.potRange);
    this.clear();
  }

  public clear(): void {
    this.rangeBuff.clear();
  }

  public duplicate(): Web {
    const dupWeb = new Web(this.varName, [...this.entry]);
    dupWeb.liveRange = new Set(this.liveRange);
    dupWeb.entry = new Set(this.entry);
    dupWeb.rangeBuff = new Set(this.rangeBuff);
    return dupWeb;
  }
}

export class InterferenceGraph {
  private nodes: InterferenceNode[] = [];
  public regesKilled: Set<LongReg> = new Set();
  public constructor(webMap: Map<string, Array<Web>>) {
    webMap.forEach((webs) => {
      webs.forEach((web) => this.nodes.push(new InterferenceNode(web)));
    });
    this.populateInterference();
    this.colorGraph();
    this.addRegesToInstructions();
    this.setRegesKilled();
  }

  private setRegesKilled() {
    this.nodes.forEach((node) => {
      this.regesKilled = setUnion(this.regesKilled, node.getRegesKilled());
    });
  }
  private populateInterference(): void {
    this.nodes.forEach((node) => {
      this.nodes.forEach((otherNode) => {
        if (node === otherNode) {
          return;
        }
        node.addInterference(otherNode);
      });
    });
  }
  private addRegesToInstructions(): void {
    this.nodes.forEach((node) => {
      if (node.register === null) {
        return;
      }
      node.nodeWeb.entry.forEach((instr) => {
        instr.setReg(node.register);
      });
    });
  }
  private colorGraph() {
    const mutNodes = this.nodes
      .filter((node) => !node.isAlwaysColorable())
      .map((node) => node);
    mutNodes.sort((a, b) => {
      // return b.weight - a.weight;
      return a.interferences.size - b.interferences.size;
    });
    while (true) {
      let colored = true;
      mutNodes.forEach((node) => {
        if (!colored) {
          return;
        }
        //color first problematic points
        colored = colored && node.colorLargeInterference();
      });
      if (colored) {
        break;
      }
      this.undoColoring();
      this.removeNode(mutNodes);
    }

    this.nodes.forEach((node) => {
      node.color();
    });
  }
  private undoColoring() {
    this.nodes.forEach((node) => {
      node.undoColor();
    });
  }

  private removeNode(mutNodes: InterferenceNode[]) {
    const stackNode = mutNodes.pop();
    if (stackNode === undefined) {
      throw new Error("stack is empty");
    }
    this.nodes.forEach((node) => {
      node.removeDependencyNode(stackNode);
    });
    stackNode.disable();
  }
  public getInterferenceNodes(): InterferenceNode[] {
    return this.nodes;
  }
}

export class InterferenceNode {
  public interferences: Set<InterferenceNode> = new Set();
  // private availableRegs: Set<LongReg> = new Set([...getLongRegs()].slice(0, 1));
  private availableRegs: Set<LongReg> = getLongRegs();
  private ogAvailableRegs: Set<LongReg> = new Set(this.availableRegs);
  public register: LongReg | ReservedLongReg | null = null;
  public weight = 1;
  private enabled = true;
  public constructor(public nodeWeb: Web) {
    for (const instr of nodeWeb.liveRange) {
      const uses = new Set(instr.getSrcs());
      if (uses.has(this.nodeWeb.varName)) {
        this.weight += instr.weight;
      }
    }
  }
  public getRegesKilled(): Set<LongReg> {
    return setDifference(this.ogAvailableRegs, this.availableRegs);
  }
  public isAlwaysColorable(): boolean {
    return this.availableRegs.size > this.interferences.size;
  }
  public disable(): void {
    this.enabled = false;
  }
  public addInterference(otherNode: InterferenceNode): void {
    const nodeWeb = this.nodeWeb;
    const otherNodeWeb = otherNode.nodeWeb;

    if (nodeWeb.varName === otherNodeWeb.varName) {
      return;
    }
    if (nodeWeb.interferesWith(otherNodeWeb)) {
      this.interferences.add(otherNode);
      otherNode.interferences.add(this);
    }
  }

  public color(): void {
    if (!this.enabled) {
      return;
    }
    if (this.register === null && this.nodeWeb.liveRange.size === 0) {
      //todo find a better way to do this. Right now there are left overs from dce that
      // have no live range (because of the stupid  runtime falloff thing) so we want to just throw
      // out the return values. This way we don't store them on the stack
      this.register = ReservedLongReg.r11;
    }
    if (this.register === null) {
      this.register = this.orderedPopAvailableRegs();
      this.removeDependencyReg(this.register);
    }
  }
  private orderedPopAvailableRegs(): LongReg {
    if (this.availableRegs.size === 0) {
      throw new Error("Set is empty");
    }

    const orderedReges: LongReg[] = [
      // ...getLongCalleeSavedRegs(), // try to assign callee saved first so we can do group compiling trick better
      LongCallerSavedReg.rdi,
      LongCallerSavedReg.rsi,
      LongCallerSavedReg.rcx,
      LongCallerSavedReg.r8,
      LongCallerSavedReg.r9,
    ];
    const regesUsed: Set<LongReg> = new Set(orderedReges);
    getLongRegs().forEach((reg) => {
      if (regesUsed.has(reg)) {
        return;
      }
      orderedReges.push(reg);
      regesUsed.add(reg);
    });

    for (const reg of orderedReges) {
      if (this.availableRegs.has(reg)) {
        this.availableRegs.delete(reg);
        return reg;
      }
    }
    throw new Error("Set is empty");
  }

  public colorLargeInterference(): boolean {
    if (!this.enabled) {
      return false;
    }
    if (this.register === null && this.nodeWeb.liveRange.size === 0) {
      //todo find a better way to do this. Right now there are left overs from dce that
      // have no live range (because of the stupid  runtime falloff thing) so we want to just throw
      // out the return values. This way we don't store them on the stack
      this.register = ReservedLongReg.r11;
      return true;
    }

    if (this.interferences.size < this.availableRegs.size) {
      //color later since these don't interfere
      return true;
    }
    if (this.register === null && this.availableRegs.size > 0) {
      this.register = setPop(this.availableRegs);
      this.removeDependencyReg(this.register);
      return true;
    }
    return false;
  }

  public removeDependencyReg(reg: LongReg): void {
    this.interferences.forEach((node) => {
      node.availableRegs.delete(reg);
    });
  }

  public undoColor(): void {
    this.register = null;
    this.availableRegs = new Set(this.ogAvailableRegs);
  }
  public removeDependencyNode(node: InterferenceNode) {
    this.interferences.delete(node);
  }
}

export class WebBuilder {
  public webMap: Map<string, Array<Web>> = new Map();
  public exploredBlocks: Set<string> = new Set();
  private killedReges: Set<LongReg> = new Set();
  private curmethod: string;
  constructor(
    block: BasicBlock,
    private cfg: ControlFlowGraph,
    private methodRegesKilled: Map<string, Set<LongReg>>
  ) {
    this.curmethod = block.label;

    this.buildWebs(block, new Map(), new Set());
    this.mergeWebs();
    //todo figure out how to properly discard of pot ranges post merge to avoid fake conflicts between webs
    // this.webMap.forEach(
    //   (webArr) => webArr.forEach((web) => web.clearPotRange()) //pot ranges now play no role for live ranges of distinct vars
    // );
  }

  public buildInterferenceNodes(): InterferenceNode[] {
    const interferenceGraph = new InterferenceGraph(this.webMap);
    this.killedReges = setUnion(
      this.killedReges,
      interferenceGraph.regesKilled
    );
    // let paramRegesKilled = this.methodRegesKilled.get(this.curmethod);
    // paramRegesKilled =
    //   paramRegesKilled === undefined ? new Set() : paramRegesKilled;
    // this.methodRegesKilled.set(
    //   this.curmethod,
    //   setUnion(this.killedReges, paramRegesKilled)
    // );
    this.methodRegesKilled.set(this.curmethod, this.killedReges); //not correct for anything except the current asm coupling
    return interferenceGraph.getInterferenceNodes();
  }
  public getKilledReges(): Set<LongReg> {
    return this.killedReges;
  }

  private buildWebs(
    curBlock: BasicBlock,
    liveWebs: Map<string, Web>,
    exploredBlocks: Set<string>
  ): void {
    const previouslyExplored = exploredBlocks.has(curBlock.label);
    if (previouslyExplored) {
      liveWebs.forEach((web) => {
        const labelInstr = curBlock.instructions[0];
        web.add(labelInstr);
        web.potentialFlush();
        this.appendNewWeb(web);
      });
      return;
    }
    exploredBlocks.add(curBlock.label);
    curBlock.instructions.forEach((instr: Instruction) => {
      if (instr instanceof CallInstruction) {
        this.handleCallKilledReges(instr);
      }
      liveWebs.forEach((web) => {
        const newWeb = web.add(instr);
        if (newWeb !== null) {
          this.appendNewWeb(web);
          liveWebs.set(newWeb.varName, newWeb);
          return;
        }
      });

      const dest = instr.getDest();
      if (
        dest &&
        !liveWebs.has(dest) &&
        !isArrayVariable(dest) &&
        !this.cfg.isGlobalVariable(dest)
      ) {
        liveWebs.set(dest, new Web(dest, [instr]));
      }
    });

    const successors = curBlock.getSuccessors();
    if (successors.length === 0) {
      liveWebs.forEach((web) => this.appendNewWeb(web));
      // exploredBlocks.delete(curBlock.label);
      return;
    }
    if (successors.length === 1) {
      this.buildWebs(successors[0], liveWebs, exploredBlocks);
      // exploredBlocks.delete(curBlock.label);
      return;
    }

    const dupLiveWebs = new Map();
    liveWebs.forEach((web, varName) => {
      const dupWeb = web.duplicate();
      dupLiveWebs.set(varName, dupWeb);
    });

    this.buildWebs(successors[0], dupLiveWebs, exploredBlocks);
    this.buildWebs(successors[1], liveWebs, exploredBlocks);
    // exploredBlocks.delete(curBlock.label);
  }
  private handleCallKilledReges(callInstr: CallInstruction): void {
    const methodName = callInstr.methodName;
    if (!this.methodRegesKilled.has(methodName)) {
      this.killedReges = setUnion(this.killedReges, getLongCallerSavedRegs());
      return;
    }

    this.killedReges = setUnion(
      this.killedReges,
      this.methodRegesKilled.get(methodName) as Set<LongReg>
    );
  }
  private appendNewWeb(web: Web) {
    const varName = web.varName;
    if (!this.webMap.has(varName)) {
      this.webMap.set(varName, []);
    }
    this.webMap.get(varName)?.push(web);
  }
  private mergeWebs(): void {
    this.webMap.forEach((webs, varName) => {
      let skip = false;
      let curSize = this.webMap.get(varName)?.length;
      let changed = true;
      while (changed) {
        const mergedWebs: Array<Web> = [];
        let websUsed = this.webMap.get(varName) as Web[];
        websUsed.forEach((web, index) => {
          websUsed.forEach((otherWeb, otherIdx) => {
            if (skip || otherIdx === index) return;
            if (otherIdx < index) {
              const mergedWeb = otherWeb.union(web);
              if (mergedWeb) {
                skip = true;
              }
              return;
            }
            web.union(otherWeb);
          });
          if (!skip) {
            mergedWebs.push(web);
          }
          skip = false;
        });
        this.webMap.set(varName, mergedWebs);
        changed = curSize !== this.webMap.get(varName)?.length;
        curSize = this.webMap.get(varName)?.length;
      }
      //   const curWebs = this.webMap.get(varName);
      //   if (curWebs === undefined) {
      //     throw new Error("what happened :sob:");
      //   }
      //   this.webMap.set(
      //     varName,
      //     curWebs.filter((web) => web.liveRange.size > 0)
      //   );
    });
  }
}

//emi stuff

// public add(newInstr: Instruction): { newWeb: Web | null; killed: boolean } {
//   const isKilled =
//     this.liveRange.has(newInstr) || this.rangeBuff.has(newInstr);
//   this.rangeBuff.add(newInstr);
//   const uses = new Set(newInstr.getSrcs());

//   if (uses.has(this.varName)) {
//     this.flush();
//   }
//   const dest = newInstr.getDest();
//   if (dest === this.varName) {
//     const newWeb = new Web(this.varName, [...this.entry]);
//     return { newWeb: newWeb, killed: true };
//   }

//   return { newWeb: null, killed: isKilled };
// }

// private buildWebs(curBlock: BasicBlock, liveWebs: Map<string, Web>): void {
//   curBlock.instructions.forEach((instr: Instruction) => {
//     liveWebs.forEach((web) => {
//       const { newWeb: newWeb, killed: iskilled } = web.add(instr);
//       if (!iskilled && newWeb !== null) {
//         this.appendNewWeb(web);
//         liveWebs.set(newWeb.varName, newWeb);
//         return;
//       }

//       if (iskilled) {
//         const varName = web.varName;
//         this.appendNewWeb(web);
//         liveWebs.delete(varName);
//       }
//     });

//     const dest = instr.getDest();
//     if (dest && !liveWebs.has(dest)) {
//       liveWebs.set(dest, new Web(dest, [instr]));
//     }
//   });

//   liveWebs.forEach((web, variable) => {
//     const entrySets = this.webMap.get(variable);
//     entrySets?.forEach((web) => {
//       web.eweb.entry;
//     });
//   });

//   const successors = curBlock.getSuccessors();
//   if (successors.length === 0) {
//     liveWebs.forEach((web) => this.appendNewWeb(web));
//     return;
//   }
//   if (successors.length === 1) {
//     this.buildWebs(successors[0], liveWebs);
//     return;
//   }

//   const dupLiveWebs = new Map();
//   liveWebs.forEach((web, varName) => {
//     dupLiveWebs.set(varName, web.duplicate());
//   });

//   this.buildWebs(successors[0], dupLiveWebs);
//   this.buildWebs(successors[1], liveWebs);
// }
