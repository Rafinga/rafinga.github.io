import { StringLiteral } from "../phase-2/semantics/ir";
import {
  BasicBlock,
  BinOpInstruction,
  CallInstruction,
  CastInstruction,
  CopyInstruction,
  Instruction,
  JumpBoolInstruction,
  LoadConstantInstruction,
  NegateInstruction,
  ReturnInstruction,
} from "../phase-3/cfgTypes";
import {
  getSplitName,
  setDifference,
  setIntersection,
  setUnion,
} from "./utils";

export class DefContainer {
  private static globalCount = 0;
  private localCount;
  public isReplaceable = true;
  public constructor(
    private blockName: string,
    public dest: string,
    public exprSrc: Instruction
  ) {
    this.localCount = DefContainer.globalCount;
    DefContainer.globalCount++;
  }

  public toString(): string {
    return `${this.blockName} assign #${this.localCount}: ${this.dest
      } = ${this.exprSrc.toString()}`;
  }
  public static resetGlobalCount() {
    DefContainer.globalCount = 0;
  }
}

export class DataFlowUtils {
  public getSurvivingDefinitions(
    currentDefinitions: Set<DefContainer>,
    block: BasicBlock
  ): Set<DefContainer> {
    const killedDefs = this.getKilledDefinitions(currentDefinitions, block);
    return setDifference(currentDefinitions, killedDefs);
  }
  public getKilledDefinitions(
    currentDefinitions: Set<DefContainer>,
    block: BasicBlock
  ): Set<DefContainer> {
    const blockDefinitions = this.getVarDefinitions(block);
    const killedDefs: Set<DefContainer> = new Set();
    currentDefinitions.forEach((def) => {
      if (blockDefinitions.has(def.dest)) {
        killedDefs.add(def);
      }
    });
    return killedDefs;
  }

  public getDefinitionExprs(block: BasicBlock): Set<DefContainer> {
    const defMap: Map<string, DefContainer> = new Map();
    block.instructions.forEach((instruction) => {
      const dest = instruction.getDest();
      if (dest) {
        const defContainer = new DefContainer(block.label, dest, instruction);
        // definitions.add(defContainer);
        defMap.set(dest, defContainer);
      }
    });
    const definitions: Set<DefContainer> = new Set([...defMap.values()]);
    DefContainer.resetGlobalCount();
    return definitions;
  }

  public getVarDefinitions(block: BasicBlock): Set<string> {
    const defExprs = this.getDefinitionExprs(block);
    const definitions: Set<string> = new Set();
    defExprs.forEach((def) => {
      definitions.add(def.dest);
    });
    return definitions;
  }

  public getUses(block: BasicBlock): Set<string> {
    let uses: Set<string> = new Set();

    block.instructions.forEach((instruction) => {
      const instructionUses = this.getInstructionUses(instruction);
      uses = setUnion(uses, instructionUses);
    });

    if (block.branchSuccessors) {
      uses.add(block.branchSuccessors.conditionVar);
    }

    return uses;
  }

  public addPotentialUse(uses: Set<string>, dest: string) {
    const potentialUse = getSplitName(dest);
    if (dest !== potentialUse) {
      uses.add(potentialUse);
    }
  }

  public getInstructionUses(instruction: Instruction): Set<string> {
    const uses: Set<string> = new Set();
    if (instruction instanceof NegateInstruction) {
      uses.add(getSplitName(instruction.src));
      return uses;
    }
    if (instruction instanceof BinOpInstruction) {
      uses.add(getSplitName(instruction.expr1));
      uses.add(getSplitName(instruction.expr2));
      return uses;
    }
    if (instruction instanceof CopyInstruction) {
      uses.add(getSplitName(instruction.src));
      this.addPotentialUse(uses, instruction.dest);
      return uses;
    }
    if (instruction instanceof CallInstruction) {
      instruction.args
        .filter((arg) => !(arg instanceof StringLiteral))
        .forEach((arg) => {
          uses.add(getSplitName(arg as string));
        });

      return uses;
    }
    if (instruction instanceof JumpBoolInstruction) {
      uses.add(instruction.conditionVar);
      return uses;
    }
    if (instruction instanceof CastInstruction) {
      uses.add(getSplitName(instruction.src));
      return uses;
    }
    if (instruction instanceof ReturnInstruction) {
      if (instruction.src) {
        uses.add(getSplitName(instruction.src));
      }
      return uses;
    }
    if (instruction instanceof LoadConstantInstruction) {
      const splitName = getSplitName(instruction.dest);
      if (splitName !== instruction.dest) {
        uses.add(splitName);
      }
      return uses;
    }
    return uses;
  }

  public computeReachingDefinitions(
    blocks: BasicBlock[]
  ): Map<BasicBlock, Set<DefContainer>> {
    DefContainer.resetGlobalCount(); // Only reset once at the start

    const inMap = new Map<BasicBlock, Set<DefContainer>>();
    const outMap = new Map<BasicBlock, Set<DefContainer>>();
    const genMap = new Map<BasicBlock, Set<DefContainer>>();

    // Cache gen sets for each block
    blocks.forEach((block) => {
      const gen = this.getDefinitionExprs(block);
      genMap.set(block, gen);
      inMap.set(block, new Set());
      outMap.set(block, new Set(gen));
    });

    let changed = true;
    while (changed) {
      changed = false;
      for (const block of blocks) {
        // in[block] = union of out[pred] for all predecessors
        let newIn = new Set<DefContainer>();
        block.getPredecessors().forEach((pred) => {
          outMap.get(pred)?.forEach((def) => newIn.add(def));
        });

        // out[block] = gen[block] U (in[block] - kill[block])
        const gen = genMap.get(block)!;
        const surviving = this.getSurvivingDefinitions(newIn, block);
        const newOut = new Set([...gen, ...surviving]);

        // Check for changes
        const oldIn = inMap.get(block)!;
        const oldOut = outMap.get(block)!;
        const inChanged =
          oldIn.size !== newIn.size ||
          [...oldIn].some((def) => !newIn.has(def));
        const outChanged =
          oldOut.size !== newOut.size ||
          [...oldOut].some((def) => !newOut.has(def));
        if (inChanged || outChanged) {
          inMap.set(block, newIn);
          outMap.set(block, newOut);
          changed = true;
        }
      }
    }
    return inMap;
  }
}
