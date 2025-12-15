import { ControlFlowGraph } from "../phase-3/cfg";
import {
    BasicBlock,
    Instruction,
    LabelInstruction,
} from "../phase-3/cfgTypes";
import {
    collectAllBlocks,
} from "./utils";
import { DataFlowUtils } from "./dataflowUtils";
import { computeDominatorTree, getAllDominators, logDominatorRelationships, populateCfgRelationships } from "../phase-3/ssa";

export class LoopOptimizer {
    private dataflowUtils: DataFlowUtils = new DataFlowUtils();
    // Map from loop header to set of nodes in the loop
    private loops: Map<BasicBlock, Set<BasicBlock>> = new Map();

    constructor(
        private program: ControlFlowGraph,
    ) { }

    public optimizeLoops(blocks: Array<BasicBlock>) {
        this.detectLoopsForMethod(blocks[0]);
        for (const [header, loop] of this.loops.entries()) {
            const invariantInstrs = this.findLoopInvariantInstructions(header, loop);
            console.log("Invariant instructions");
            this.hoistInvariantInstructions(header, invariantInstrs, loop);
            console.log("Hoist");
        }
    }

    /**
     * Detects natural loops in a single method's CFG.
     * Populates this.loops with header -> loop nodes for this method.
     */
    public detectLoopsForMethod(methodEntryBlock: BasicBlock) {

        // Compute dominators for each block in this method
        populateCfgRelationships(methodEntryBlock);
        methodEntryBlock = computeDominatorTree(methodEntryBlock);
        getAllDominators(methodEntryBlock);
        logDominatorRelationships(methodEntryBlock);

        // Collect all blocks in this method's CFG
        const blocks = collectAllBlocks(methodEntryBlock);

        // Find all back edges (n -> d where d dominates n)
        for (const block of blocks) {
            for (const domPred of block.allDomPredecessors) {
                if (block.successors?.includes(domPred)) {
                    // Found a back edge: block -> succ (succ is header)
                    const loop = this.constructLoop(domPred, block);
                    // Merge with existing loop if header already present
                    if (this.loops.has(domPred)) {
                        const existing = this.loops.get(domPred)!;
                        loop.forEach(node => existing.add(node));
                    } else {
                        this.loops.set(domPred, loop);
                    }
                }
            }
        }
    }



    /**
     * Constructs the loop set for a given back edge (n -> d).
     * @param header The loop header (d)
     * @param node The source of the back edge (n)
     */
    private constructLoop(header: BasicBlock, node: BasicBlock): Set<BasicBlock> {
        const loop = new Set<BasicBlock>();
        const stack: BasicBlock[] = [];
        loop.add(header);
        if (header !== node) {
            loop.add(node);
            stack.push(node);
        }
        while (stack.length > 0) {
            const m = stack.pop()!;
            for (const pred of m.predecessors) {
                if (!loop.has(pred)) {
                    loop.add(pred);
                    stack.push(pred);
                }
            }
        }
        return loop;
    }
    private findLoopInvariantInstructions(header: BasicBlock, loop: Set<BasicBlock>): Instruction[] {
        const blocks = Array.from(loop);
        // Compute reaching definitions for all blocks in the loop
        const inMap = this.dataflowUtils.computeReachingDefinitions(blocks);

        // Compute dominators for the loop blocks
        //dominators are already collected

        // Find exit blocks for the loop
        const exitBlocks = this.findLoopExitBlocks(loop);

        // Collect all instructions in the loop in order
        const allInstructions: Instruction[] = [];
        for (const block of blocks.filter(block => block !== header)) {
            for (const instr of block.instructions) {
                if (!(instr instanceof LabelInstruction)) {
                    allInstructions.push(instr);
                }
            }
        }

        // Use a Set for fast lookup, and an array for order
        const invariantSet = new Set<Instruction>();
        const invariantOrdered: Instruction[] = [];

        // Helper: check if all reaching defs for a variable are not inside loop
        const allDefsAreNotInsideLoop = (variable: string) => {
            for (const block of blocks) {
                const defs = [...inMap.get(block)!].filter(def => def.dest === variable);
                for (const def of defs) {
                    const parentBlock = blocks.find(b => b.instructions.includes(def.exprSrc));
                    if (parentBlock && loop.has(parentBlock)) {
                        return false;
                    }
                }
            }
            return true;
        };

        // Helper: check if all reaching defs for a variable are from invariant statements
        const allDefsFromInvariant = (variable: string) => {
            for (const block of blocks) {
                const defs = [...inMap.get(block)!].filter(def => def.dest === variable);
                for (const def of defs) {
                    if (!invariantSet.has(def.exprSrc)) {
                        return false;
                    }
                }
            }
            return true;
        };

        // Helper: check if exactly one reaching def for a variable, and it's from invariant
        const exactlyOneDefFromInvariant = (variable: string) => {
            let found = null;
            for (const block of blocks) {
                const defs = [...inMap.get(block)!].filter(def => def.dest === variable);
                for (const def of defs) {
                    if (found !== null) return false; // More than one
                    found = def.exprSrc;
                }
            }
            return found !== null && invariantSet.has(found);
        };

        // First pass: mark instructions with only constant operands or all reaching defs outside loop
        for (const instr of allInstructions) {
            console.log("EVALUATED INSTRR", instr);
            console.log("Is Constant Instruction", instr.isConstant());
            console.log("Every source does not have reaching def inside", instr.getSrcs().every((op: string) => allDefsAreNotInsideLoop(op)));
            console.log("safe to hoist", this.isSafeToHoist(instr, loop, allInstructions, exitBlocks));
            if (
                (instr.isConstant() ||
                    instr.getSrcs().every((op: string) => allDefsAreNotInsideLoop(op))) &&
                this.isSafeToHoist(instr, loop, allInstructions, exitBlocks)
            ) {
                invariantSet.add(instr);
                invariantOrdered.push(instr);
            }
        }

        // Iterative pass
        let changed = true;
        do {
            changed = false;
            for (const instr of allInstructions) {
                if (!invariantSet.has(instr)) {
                    if (
                        (instr.isConstant() ||
                            instr.getSrcs().every((op: string) => allDefsAreNotInsideLoop(op)) ||
                            instr.getSrcs().every((op: string) => exactlyOneDefFromInvariant(op)) ||
                            instr.getSrcs().every((op: string) => allDefsFromInvariant(op))) && this.isSafeToHoist(instr, loop, allInstructions, exitBlocks)) {
                        invariantSet.add(instr);
                        invariantOrdered.push(instr);
                        changed = true;
                    }
                }
            }
        } while (changed);
        console.log("Invariant Ordered", invariantOrdered);
        return invariantOrdered;
    }

    private findLoopExitBlocks(loop: Set<BasicBlock>): BasicBlock[] {
        const exits: BasicBlock[] = [];
        for (const block of loop) {
            for (const succ of block.domSuccessors) {
                if (!loop.has(succ)) {
                    exits.push(succ);
                }
            }
        }
        console.log("Loop exits", exits[0]);
        return exits;
    }

    private hoistInvariantInstructions(header: BasicBlock, invariantInstrs: Instruction[], loop: Set<BasicBlock>): void {
        if (invariantInstrs.length == 0) {
            return;
        }


        for (const instr of invariantInstrs) {
            // Remove from original block
            const origBlock = Array.from(loop).find(b => b.instructions.includes(instr));
            if (!origBlock) {
                throw new Error("Should not reach this point");
            }
            origBlock.instructions = origBlock.instructions.filter((i: Instruction) => i !== instr);
        }
        // Insert all at the header's predecessor, in order
        header.domPredecessors[0].instructions = [...invariantInstrs, ...header.domPredecessors[0].instructions];
    }

    private isSafeToHoist(instr: Instruction, loop: Set<BasicBlock>, allInstructions: Instruction[], exitBlocks: BasicBlock[]): boolean {
        const dest = instr.getDest();
        if (!dest) return false;

        // 1. No other statement in loop assigns to dest
        for (const other of allInstructions) {
            if (other !== instr && other.getDest && other.getDest() === dest) {
                console.log("Has other statement in loop that assigns to dest")
                return false;
            }
        }

        // 2. No use of dest in loop is reached by a definition other than instr
        for (const block of loop) {
            for (const useInstr of block.instructions) {
                for (const src of useInstr.getSrcs()) {
                    if (src === dest) {
                        // Check reaching definitions for this use
                        // (Assume you have a reaching definitions map: inMap)
                        const defs = [...this.dataflowUtils.computeReachingDefinitions([block]).get(block)!].filter(def => def.dest === dest);
                        if (defs.some(def => def.exprSrc !== instr)) {
                            console.log("Fails 2. No use of dest in loop is reached by a definition other than instr")
                            return false;
                        }
                    }
                }
            }
        }

        // // 3. instr dominates all loop exits
        // for (const exit of exitBlocks) {
        //     const instrBlock = Array.from(loop).find(b => b.instructions.includes(instr));
        //     if (!instrBlock) {
        //         console.log("Instruction block not found");
        //         return false;
        //     }
        //     if (!exit.allDomPredecessors.has(instrBlock)) {
        //         console.log("EXIT BLOCK", exit);
        //         console.log("exit predecessors", exit.allDomPredecessors);
        //         console.log('instrblock', instrBlock);
        //         console.log("Does not dominate all loop exits");
        //         return false;
        //     }
        // }

        return true;
    }
}
