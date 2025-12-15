import { get } from "http";
import {
  JumpBoolInstruction,
  JumpDirectInstruction,
  NegateInstruction,
  ReturnInstruction,
  CreateArrayInstruction,
  CreateVarInstruction,
} from "./cfgTypes";
import { CastInstruction } from "./cfgTypes";
import { CallInstruction } from "./cfgTypes";
import { LoadConstantInstruction } from "./cfgTypes";
import {
  BasicBlock,
  PhiInstruction,
  Instruction,
  BinOpInstruction,
  CopyInstruction,
} from "./cfgTypes";
import { collectAllBlocks, setUnion } from "../phase-4/utils";

//CFG to SSA

export function convertToSSA(entryBlock: BasicBlock): BasicBlock {
  populateCfgRelationships(entryBlock);
  // logCfgRelationships(entryBlock);
  computeDominatorTree(entryBlock);
  // logDominatorRelationships(entryBlock);
  const dominanceFrontiers = computeDominanceFrontiers(entryBlock);
  const defSites = collectDefSites(entryBlock); //places where variable are defined
  // printDefSites(defSites);
  const iteratedFrontiers = computeIteratedDominanceFrontiers(
    defSites,
    dominanceFrontiers
  );
  const variablesWithPhiFunctions = insertPhiFunctions(
    iteratedFrontiers,
    defSites
  );
  // printVariablesWithPhiFunctions(variablesWithPhiFunctions)
  renameVariables(entryBlock);
  cleanupPhiFunctions(entryBlock); //patchup to remove phi funcs with indexed var

  return entryBlock;
}

//populating CFG successors and predecessors fields
export function populateCfgRelationships(entryBlock: BasicBlock): void {
  const blocks = getCfgTree(entryBlock);
  const blockMap = new Map<string, BasicBlock>();

  for (const block of blocks) {
    blockMap.set(block.label, block);
  }

  for (const block of blocks) {
    block.successors = [];
    block.predecessors = [];
  }

  // populate successors
  for (const block of blocks) {
    if (block.branchSuccessors) {
      addSuccessor(block, block.branchSuccessors.trueBlock);
      addSuccessor(block, block.branchSuccessors.falseBlock);
    }

    if (block.joinSuccessor) {
      addSuccessor(block, block.joinSuccessor);
    }

    // if (block.shadowSuccessor) {
    //   addSuccessor(block, block.shadowSuccessor);
    // }
  }

  // populate predecessors
  for (const block of blocks) {
    for (const predLabel of block.mutPredecessors) {
      const predBlock = blockMap.get(predLabel.toString());
      if (predBlock) {
        if (!block.predecessors.includes(predBlock)) {
          block.predecessors.push(predBlock);
        }
      }
    }
  }

  checkConsistency(blocks);
}

// get array of all cfg blocks
function getCfgTree(entryBlock: BasicBlock): BasicBlock[] {
  const visited = new Set<string>();
  const blocks: BasicBlock[] = [];

  function visit(block: BasicBlock): void {
    if (visited.has(block.label)) {
      return;
    }

    visited.add(block.label);
    blocks.push(block);

    if (block.branchSuccessors) {
      visit(block.branchSuccessors.trueBlock);
      visit(block.branchSuccessors.falseBlock);
    }

    if (block.joinSuccessor) {
      visit(block.joinSuccessor);
    }

    // if (block.shadowSuccessor) {
    //   visit(block.shadowSuccessor);
    // }
  }

  visit(entryBlock);
  return blocks;
}

// adds successor to bloock and updates successor's predecessors
function addSuccessor(block: BasicBlock, successor: BasicBlock): void {
  if (!block.successors.includes(successor)) {
    block.successors.push(successor);
  }

  if (!successor.predecessors.includes(block)) {
    successor.predecessors.push(block);
  }
}

// check successor/predecessor consistency
function checkConsistency(blocks: BasicBlock[]): void {
  for (const block of blocks) {
    //succ of block have pred
    for (const successor of block.successors) {
      if (!successor.predecessors.includes(block)) {
        successor.predecessors.push(block);
      }
    }

    //pred of block have succ
    for (const predecessor of block.predecessors) {
      if (!predecessor.successors.includes(block)) {
        predecessor.successors.push(block);
      }
    }
  }
}

//log cfg relationships
export function logCfgRelationships(entryBlock: BasicBlock): void {
  const blocks = getCfgTree(entryBlock);

  console.log("CFG Tree Relationships");

  for (const block of blocks) {
    console.log(`Block: ${block.label}`);

    console.log(`  Successors (${block.successors.length}):`);
    for (const succ of block.successors) {
      console.log(`    - ${succ.label}`);
    }

    console.log(`  Predecessors (${block.predecessors.length}):`);
    for (const pred of block.predecessors) {
      console.log(`    - ${pred.label}`);
    }

    console.log("");
  }
}

//cfg in dot format
export function visualizeDetailedCfgTreeDot(entryBlock: BasicBlock): string {
  const visited = new Set<string>();
  const nodes: string[] = [];
  const edges: string[] = [];

  // Process a block and its successors
  function processBlock(block: BasicBlock) {
    if (visited.has(block.label)) {
      return;
    }

    visited.add(block.label);

    // Sanitize the label for DOT
    const nodeId = block.label.replace(/[^a-zA-Z0-9]/g, "_");

    // Create a label with all instructions
    let nodeLabel = `${block.label}`;

    // Add all phi instructions
    if (block.phiInstructions.length > 0) {
      nodeLabel += "\\n\\nPhi Instructions:";
      for (const phi of block.phiInstructions) {
        // Escape quotes and other problematic characters
        nodeLabel += `\\n${phi
          .toString()
          .replace(/"/g, '\\"')
          .replace(/\|/g, "\\|")}`;
      }
    }

    // add all instructions except label
    const instructions = block.instructions.slice(1);
    if (instructions.length > 0) {
      nodeLabel += "\\n\\nInstructions:";
      for (const instr of instructions) {
        nodeLabel += `\\n${instr
          .toString()
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\|/g, "\\|")}`;
      }
    } else {
      nodeLabel += "\\n\\n(No instructions)";
    }

    nodes.push(
      `  ${nodeId} [label="${nodeLabel}", shape=box, style=filled, fillcolor=lightgrey];`
    );

    if (block.branchSuccessors) {
      const trueBlockId = block.branchSuccessors.trueBlock.label.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      const falseBlockId = block.branchSuccessors.falseBlock.label.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      edges.push(`  ${nodeId} -> ${trueBlockId} [label="true", color=green];`);
      edges.push(`  ${nodeId} -> ${falseBlockId} [label="false", color=red];`);

      processBlock(block.branchSuccessors.trueBlock);
      processBlock(block.branchSuccessors.falseBlock);
    }

    if (block.joinSuccessor) {
      const joinBlockId = block.joinSuccessor.label.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      edges.push(`  ${nodeId} -> ${joinBlockId} [label="join", style=dashed];`);
      processBlock(block.joinSuccessor);
    }

    // if (block.shadowSuccessor) {
    //   const shadowBlockId = block.shadowSuccessor.label.replace(/[^a-zA-Z0-9]/g, '_');
    //   edges.push(`  ${nodeId} -> ${shadowBlockId} [label="shadow", style=dotted, color=blue];`);
    //   processBlock(block.shadowSuccessor);
    // }
  }

  // Start with entry block
  processBlock(entryBlock);

  // Generate the DOT diagram
  return [
    "digraph CFG {",
    '  node [fontname="Courier New", fontsize=10];',
    '  edge [fontname="Helvetica", fontsize=9];',
    "  rankdir=TB;",
    ...nodes,
    ...edges,
    "}",
  ].join("\n");
}

//dominator tree
// 1. dominators of entry block are itself
// 2. initialize dominators of all other blocks to be all blocks
// 3. iteratively refine the dominators until unchanged
// 4. find immediate dominators and build the dominator tree

export function computeDominatorTree(entry: BasicBlock): BasicBlock {
  const blocks = getCfgTree(entry);

  for (const block of blocks) {
    block.domPredecessors = [];
    block.domSuccessors = [];
  }

  if (blocks.length === 1) {
    return entry;
  }

  // maps block to set of blocks that dominate it
  const dominators = new Map<BasicBlock, Set<BasicBlock>>();

  // dominators of entry block are itself
  dominators.set(entry, new Set([entry]));

  // initialize dominators of all other blocks to be all blocks
  for (const block of blocks) {
    if (block !== entry) {
      dominators.set(block, new Set(blocks));
    }
  }

  // iteratively refine the dominators until unchanged
  let changed = true;
  while (changed) {
    changed = false;

    for (const block of blocks) {
      if (block === entry) {
        continue;
      }
      // skip unreachable blocks
      if (block.predecessors.length === 0) {
        continue;
      }

      // add dominators of first predecessor
      const firstPred = block.predecessors[0];
      if (!dominators.has(firstPred)) {
        continue;
      }

      const newDoms = new Set<BasicBlock>();
      for (const dom of dominators.get(firstPred)!) {
        newDoms.add(dom);
      }

      // intersect with dominators of other predecessors
      for (let i = 1; i < block.predecessors.length; i++) {
        const pred = block.predecessors[i];
        if (!dominators.has(pred)) {
          continue;
        }
        const predDoms = dominators.get(pred)!;
        for (const dom of newDoms) {
          if (!predDoms.has(dom)) {
            newDoms.delete(dom);
          }
        }
      }

      // block is its own dominator
      newDoms.add(block);

      // check if dominator set changed + add new dominators
      const oldDoms = dominators.get(block)!;
      if (newDoms.size !== oldDoms.size) {
        dominators.set(block, newDoms);
        changed = true;
      } else {
        let different = false;
        for (const dom of newDoms) {
          if (!oldDoms.has(dom)) {
            different = true;
            break;
          }
        }

        if (different) {
          dominators.set(block, newDoms);
          changed = true;
        }
      }
    }
  }

  // find immediate dominators and build the dominator tree
  for (const block of blocks) {
    if (block === entry) continue;

    const blockDoms = dominators.get(block)!;
    if (!blockDoms || blockDoms.size <= 1) continue;

    const strictDoms = new Set(blockDoms);
    strictDoms.delete(block);

    let idom: BasicBlock | null = null;

    for (const dom of strictDoms) {
      let isIdom = true;

      // check if this dominator dominates other dominators of this block
      for (const otherDom of strictDoms) {
        if (dom === otherDom) {
          continue;
        }

        const otherDomDoms = dominators.get(otherDom);
        if (otherDomDoms && otherDomDoms.has(dom)) {
          isIdom = false;
          break;
        }
      }

      if (isIdom) {
        idom = dom;
        break;
      }
    }

    // if no unique idom, find closest
    if (!idom) {
      for (const pred of block.predecessors) {
        if (strictDoms.has(pred)) {
          let isBetterIdom = true;

          for (const otherPred of block.predecessors) {
            if (pred === otherPred) {
              continue;
            }

            // check if dominators of other predecessor also dominates this pred
            const otherPredDoms = dominators.get(otherPred);
            if (otherPredDoms && otherPredDoms.has(pred)) {
              isBetterIdom = false;
              break;
            }
          }

          if (isBetterIdom) {
            idom = pred;
            break;
          }
        }
      }

      // if no idom, entry block dominates
      if (!idom) {
        idom = entry;
      }
    }

    // update dominator relationships
    if (idom) {
      block.domPredecessors = [idom];

      if (!idom.domSuccessors.includes(block)) {
        idom.domSuccessors.push(block);
      }
    }
  }

  return entry;
}

// compute all dominators of a given basic block
export function getAllDominators(entryBlock: BasicBlock): void {
  const blocks = collectAllBlocks(entryBlock);
  for (const block of blocks) {
    let curDom = block;
    while (curDom.domPredecessors.length !== 0) {
      curDom = curDom.domPredecessors[0];
      for (const succ of block.domSuccessors) {
        succ.allDomPredecessors.add(curDom)
      }
    }
  }

}

//log dominator tree relationships
export function logDominatorRelationships(entryBlock: BasicBlock): void {
  const blocks = getCfgTree(entryBlock);

  console.log("Dominator Tree Relationships");

  for (const block of blocks) {
    console.log(`Block: ${block.label}`);

    console.log(`  Immediate Dominator:`);
    if (block.domPredecessors.length > 0) {
      console.log(`    - ${block.domPredecessors[0].label}`);
    } else {
      console.log(`    - None (entry block or unreachable)`);
    }

    console.log(`  All Predecessor Dominators:`);
    for (const succ of block.allDomPredecessors) {
      console.log(`    - ${succ.label}`);
    }

    console.log(`  Dominates (${block.domSuccessors.length}):`);
    for (const succ of block.domSuccessors) {
      console.log(`    - ${succ.label}`);
    }

    console.log("");
  }
}

//dominator tree in dot format
export function visualizeDominatorTree(entry: BasicBlock): string {
  // Compute the dominator tree if not already done
  computeDominatorTree(entry);

  const visited = new Set<string>();
  const nodes: string[] = [];
  const edges: string[] = [];

  function processBlock(block: BasicBlock): void {
    if (visited.has(block.label)) return;
    visited.add(block.label);

    // Sanitize the label for DOT
    const nodeId = block.label.replace(/[^a-zA-Z0-9]/g, "_");

    // Create node label
    nodes.push(
      `  ${nodeId} [label="${block.label}", shape=box, style=filled, fillcolor=lightblue];`
    );

    // Process dominator successors
    for (const domSuccessor of block.domSuccessors) {
      const successorId = domSuccessor.label.replace(/[^a-zA-Z0-9]/g, "_");
      edges.push(`  ${nodeId} -> ${successorId} [color=blue, penwidth=1.5];`);
      processBlock(domSuccessor);
    }
  }

  // Start from entry block
  processBlock(entry);

  // Generate the DOT diagram
  return [
    "digraph DominatorTree {",
    '  graph [fontname="Helvetica", fontsize=12];',
    '  node [fontname="Helvetica", fontsize=10];',
    '  edge [fontname="Helvetica", fontsize=9];',
    "  rankdir=TB;",
    ...nodes,
    ...edges,
    "}",
  ].join("\n");
}

//dominance frontiers
function computeDominanceFrontiers(
  entryBlock: BasicBlock
): Map<BasicBlock, Set<BasicBlock>> {
  const blocks = getCfgTree(entryBlock);
  const dominanceFrontiers = new Map<BasicBlock, Set<BasicBlock>>();

  for (const block of blocks) {
    dominanceFrontiers.set(block, new Set());
  }

  // each block w/ multiple predecessors
  for (const block of blocks) {
    if (block.predecessors.length >= 2) {
      for (const pred of block.predecessors) {
        let runner = pred;

        // up dominator tree until we reach a node that dominates the current block
        while (runner !== block && !isDominator(runner, block)) {
          // add the current block to the dominance frontier of the runner
          const frontier = dominanceFrontiers.get(runner);
          if (frontier) {
            frontier.add(block);
          }

          // up the dominator tree
          if (runner.domPredecessors.length > 0) {
            runner = runner.domPredecessors[0];
          } else {
            break;
          }
        }
      }
    }
  }

  return dominanceFrontiers;
}

//check if one block dominates another
function isDominator(dominator: BasicBlock, block: BasicBlock): boolean {
  if (dominator === block) return true;

  // up the dominator tree from block
  let current = block;
  while (current.domPredecessors.length > 0) {
    current = current.domPredecessors[0];
    if (current === dominator) {
      return true;
    }
  }

  return false;
}

//collect variable definition sites/where vars are assigned values
function collectDefSites(entryBlock: BasicBlock): Map<string, Set<BasicBlock>> {
  const blocks = getCfgTree(entryBlock);
  const defSites = new Map<string, Set<BasicBlock>>();

  for (const block of blocks) {
    // check all instructions for variable definitions
    for (const instr of block.instructions) {
      let varName: string | null = null;

      if (instr instanceof CopyInstruction) {
        varName = instr.dest;
      } else if (instr instanceof BinOpInstruction) {
        varName = instr.dest;
      } else if (instr instanceof LoadConstantInstruction) {
        varName = instr.dest;
      } else if (instr instanceof CastInstruction) {
        varName = instr.dest;
      } else if (instr instanceof CallInstruction && instr.returnVar) {
        varName = instr.returnVar;
      } else if (instr instanceof CreateVarInstruction) {
        varName = instr.name;
      } else if (instr instanceof CreateArrayInstruction) {
        varName = instr.name;
      } else if (instr instanceof NegateInstruction) {
        varName = instr.dest;
      }

      if (varName) {
        let sites = defSites.get(varName);
        if (!sites) {
          sites = new Set<BasicBlock>();
          defSites.set(varName, sites);
        }
        sites.add(block);
      }
    }
  }
  return defSites;
}

function printDefSites(defSites: Map<string, Set<BasicBlock>>): void {
  console.log("Variable Definition Sites:");
  for (const [varName, blocks] of defSites.entries()) {
    console.log(`Variable: ${varName}`);
    console.log("Defined in blocks:");
    Array.from(blocks).forEach((block, index) => {
      console.log(`  Block ${block.label}`);
    });
    console.log(); // Empty line for readability
  }
}

//compute iterated dominance frontiers for var definition sites
function computeIteratedDominanceFrontiers(
  defSites: Map<string, Set<BasicBlock>>,
  dominanceFrontiers: Map<BasicBlock, Set<BasicBlock>>
): Map<string, Set<BasicBlock>> {
  const iteratedFrontiers = new Map<string, Set<BasicBlock>>();

  // for each variable and its def sites
  for (const [varName, blocks] of defSites.entries()) {
    const visited = new Set<BasicBlock>();
    const worklist: BasicBlock[] = Array.from(blocks);
    const frontier = new Set<BasicBlock>();

    while (worklist.length > 0) {
      const block = worklist.pop()!;

      const df = dominanceFrontiers.get(block);
      if (!df) {
        continue;
      }

      for (const frontierBlock of df) {
        if (visited.has(frontierBlock)) {
          continue;
        }

        visited.add(frontierBlock);
        frontier.add(frontierBlock);
        worklist.push(frontierBlock);
      }
    }

    iteratedFrontiers.set(varName, frontier);
  }

  return iteratedFrontiers;
}

// insert phi functions
export function insertPhiFunctions(
  iteratedFrontiers: Map<string, Set<BasicBlock>>,
  defSites: Map<string, Set<BasicBlock>>
): Map<string, Map<BasicBlock, BasicBlock[]>> {
  const variablesWithPhiFunctions = new Map<
    string,
    Map<BasicBlock, BasicBlock[]>
  >();

  for (const [variable, blocks] of iteratedFrontiers.entries()) {
    const variableDefSites = defSites.get(variable) || new Set();

    for (const block of blocks) {
      if (!variableDefSites.size) {
        continue;
      }

      if (variableDefSites.size <= 1) {
        // a bit hacky
        continue;
      }
      // console.log('defsites', variable, variableDefSites.size)

      // skip if there's already a phi for this var
      const already = block.phiInstructions.some(
        (phi) => phi.variable === variable
      );
      if (already) {
        continue;
      }

      // track predecessors with paths to definition
      const predecessorsWithPaths: BasicBlock[] = [];
      for (const pred of block.predecessors) {
        const pathToDefinition = findPathsToDefinition(pred, variableDefSites);
        if (pathToDefinition.length > 0) {
          predecessorsWithPaths.push(pred);
        }
      }

      // console.log('predwithpath', variable, predecessorsWithPaths.length)

      // add phi only if >= 2 definitions from diff preds can reach this block
      if (predecessorsWithPaths.length >= 2) {
        const phi = new PhiInstruction(variable, new Map());
        block.phiInstructions.push(phi);

        // track this variable's phi function with predecessor details
        let blockMap = variablesWithPhiFunctions.get(variable);
        if (!blockMap) {
          blockMap = new Map<BasicBlock, BasicBlock[]>();
          variablesWithPhiFunctions.set(variable, blockMap);
        }
        blockMap.set(block, predecessorsWithPaths);
      }
    }
  }

  return variablesWithPhiFunctions;
}

function printVariablesWithPhiFunctions(
  variablesWithPhiFunctions: Map<string, Map<BasicBlock, BasicBlock[]>>
): void {
  console.log("Variables with Phi Functions:");
  for (const [variable, blockMap] of variablesWithPhiFunctions.entries()) {
    console.log(`Variable: ${variable}`);
    console.log("Phi Functions Details:");

    for (const [block, predecessors] of blockMap.entries()) {
      console.log(`  Block ID: ${block.label}`);
      console.log(
        `  Number of Predecessors with Path to Definition: ${predecessors.length}`
      );
      console.log(
        `  Predecessor Block IDs: ${predecessors
          .map((p) => p.label)
          .join(", ")}`
      );
    }
    console.log();
  }
}

// check if a block has a path to a definition
function findPathsToDefinition(
  block: BasicBlock,
  definitionSites: Set<BasicBlock>
): BasicBlock[] {
  const pathBlocks: BasicBlock[] = [];
  const visited = new Set<BasicBlock>();

  function dfs(currentBlock: BasicBlock): boolean {
    if (visited.has(currentBlock)) return false;
    visited.add(currentBlock);

    // check if this block is a definition site
    if (definitionSites.has(currentBlock)) {
      pathBlocks.push(currentBlock);
      return true;
    }

    // recursively check predecessors
    for (const pred of currentBlock.predecessors) {
      if (dfs(pred)) {
        pathBlocks.push(currentBlock);
        return true;
      }
    }

    return false;
  }

  dfs(block);

  return pathBlocks;
}

// rename vars
function renameVariables(entryBlock: BasicBlock): void {
  // counter for generating new SSA names
  const counters = new Map<string, number>();

  // stack of the current SSA version
  const stacks = new Map<string, number[]>();

  const allVars = collectAllVariables(entryBlock);
  for (const varName of allVars) {
    counters.set(varName, 0);
    stacks.set(varName, [0]);
  }

  // rename variables in the dominator tree
  function renameBlockVars(block: BasicBlock): void {
    const savedStacks = new Map<string, number[]>();
    for (const [varName, stack] of stacks.entries()) {
      savedStacks.set(varName, [...stack]);
    }

    // rename vars in phi functions
    for (const phi of block.phiInstructions) {
      const varName = getOriginalName(phi.variable);

      const counter = counters.get(varName) || 0;
      const newName = `${varName}_${counter}`;

      phi.variable = newName;

      counters.set(varName, counter + 1);
      const stack = stacks.get(varName) || [];
      stack.push(counter);
      stacks.set(varName, stack);
    }

    // rename vars in regular instructions
    for (let i = 0; i < block.instructions.length; i++) {
      const instr = block.instructions[i];

      renameInstructionVars(instr, stacks, counters);
    }

    // add phi function arguments in successor blocks
    for (const succ of block.successors) {
      for (const phi of succ.phiInstructions) {
        const varName = getOriginalName(phi.variable);

        const stack = stacks.get(varName);
        if (stack && stack.length > 0) {
          const version = stack[stack.length - 1];
          const ssaName = `${varName}_${version}`;

          phi.sources.set(block, ssaName);
        }
      }
    }

    // process dominator children
    for (const child of block.domSuccessors) {
      renameBlockVars(child);
    }

    // restore original stacks
    for (const [varName, stack] of savedStacks.entries()) {
      stacks.set(varName, stack);
    }
  }

  renameBlockVars(entryBlock);
}

//rename vars in instruction
function renameInstructionVars(
  instr: Instruction,
  stacks: Map<string, number[]>,
  counters: Map<string, number>
): void {
  if (instr instanceof CopyInstruction) {
    const srcStack = stacks.get(instr.src);
    if (srcStack && srcStack.length > 0) {
      const version = srcStack[srcStack.length - 1];
      instr.src = `${instr.src}_${version}`;
    }

    // if (typeof instr.srcIndex === "string") {
    //   const indexStack = stacks.get(instr.srcIndex);
    //   if (indexStack && indexStack.length > 0) {
    //     const version = indexStack[indexStack.length - 1];
    //     instr.srcIndex = `${instr.srcIndex}_${version}`;
    //   }
    // }

    // if (typeof instr.destIndex === "string") {
    //   const indexStack = stacks.get(instr.destIndex);
    //   if (indexStack && indexStack.length > 0) {
    //     const version = indexStack[indexStack.length - 1];
    //     instr.destIndex = `${instr.destIndex}_${version}`;
    //   }
    // }

    const destName = instr.dest;
    const counter = counters.get(destName) || 0;
    const newName = `${destName}_${counter}`;

    instr.dest = newName;

    counters.set(destName, counter + 1);
    const stack = stacks.get(destName) || [];
    stack.push(counter);
    stacks.set(destName, stack);
  } else if (instr instanceof BinOpInstruction) {
    const expr1Stack = stacks.get(instr.expr1);
    if (expr1Stack && expr1Stack.length > 0) {
      const version = expr1Stack[expr1Stack.length - 1];
      instr.expr1 = `${instr.expr1}_${version}`;
    }

    const expr2Stack = stacks.get(instr.expr2);
    if (expr2Stack && expr2Stack.length > 0) {
      const version = expr2Stack[expr2Stack.length - 1];
      instr.expr2 = `${instr.expr2}_${version}`;
    }

    const destName = instr.dest;
    const counter = counters.get(destName) || 0;
    const newName = `${destName}_${counter}`;

    instr.dest = newName;

    counters.set(destName, counter + 1);
    const stack = stacks.get(destName) || [];
    stack.push(counter);
    stacks.set(destName, stack);
  } else if (instr instanceof NegateInstruction) {
    const srcStack = stacks.get(instr.src);
    if (srcStack && srcStack.length > 0) {
      const version = srcStack[srcStack.length - 1];
      instr.src = `${instr.src}_${version}`;
    }

    const destName = instr.dest;
    const counter = counters.get(destName) || 0;
    const newName = `${destName}_${counter}`;

    instr.dest = newName;

    counters.set(destName, counter + 1);
    const stack = stacks.get(destName) || [];
    stack.push(counter);
    stacks.set(destName, stack);
  } else if (instr instanceof CastInstruction) {
    const srcStack = stacks.get(instr.src);
    if (srcStack && srcStack.length > 0) {
      const version = srcStack[srcStack.length - 1];
      instr.src = `${instr.src}_${version}`;
    }

    const destName = instr.dest;
    const counter = counters.get(destName) || 0;
    const newName = `${destName}_${counter}`;

    instr.dest = newName;

    counters.set(destName, counter + 1);
    const stack = stacks.get(destName) || [];
    stack.push(counter);
    stacks.set(destName, stack);
  } else if (instr instanceof LoadConstantInstruction) {
    const destName = instr.dest;
    const counter = counters.get(destName) || 0;
    const newName = `${destName}_${counter}`;

    instr.dest = newName;

    counters.set(destName, counter + 1);
    const stack = stacks.get(destName) || [];
    stack.push(counter);
    stacks.set(destName, stack);
  } else if (instr instanceof JumpBoolInstruction) {
    const condStack = stacks.get(instr.conditionVar);
    if (condStack && condStack.length > 0) {
      const version = condStack[condStack.length - 1];
      instr.conditionVar = `${instr.conditionVar}_${version}`;
    }
  } else if (instr instanceof ReturnInstruction && instr.src) {
    const srcStack = stacks.get(instr.src);
    if (srcStack && srcStack.length > 0) {
      const version = srcStack[srcStack.length - 1];
      instr.src = `${instr.src}_${version}`;
    }
  } else if (instr instanceof CallInstruction) {
    //rename all args
    if (instr.args && Array.isArray(instr.args)) {
      for (let i = 0; i < instr.args.length; i++) {
        const arg = instr.args[i];
        if (typeof arg === "string" && !arg.startsWith('"')) {
          const argStack = stacks.get(arg);
          if (argStack && argStack.length > 0) {
            const version = argStack[argStack.length - 1];
            instr.args[i] = `${arg}_${version}`;
          }
        }
      }
    }
    // return var
    if (instr.returnVar) {
      const returnName = instr.returnVar;
      const counter = counters.get(returnName) || 0;
      const newName = `${returnName}_${counter}`;

      instr.returnVar = newName;

      counters.set(returnName, counter + 1);
      const stack = stacks.get(returnName) || [];
      stack.push(counter);
      stacks.set(returnName, stack);
    }
  }
}

// get original variable name without index
function getOriginalName(ssaName: string): string {
  const lastUnderscorePos = ssaName.lastIndexOf("_");
  if (lastUnderscorePos === -1) return ssaName;

  const suffix = ssaName.substring(lastUnderscorePos + 1);
  if (/^\d+$/.test(suffix)) {
    return ssaName.substring(0, lastUnderscorePos);
  }

  return ssaName;
}

// get all vars in CFG
function collectAllVariables(entryBlock: BasicBlock): Set<string> {
  const blocks = getCfgTree(entryBlock);
  const variables = new Set<string>();

  for (const block of blocks) {
    for (const instr of block.instructions) {
      collectVarsFromInstruction(instr, variables);
    }
  }

  return variables;
}

// get all vars in an instruction
function collectVarsFromInstruction(
  instr: Instruction,
  variables: Set<string>
): void {
  if (instr instanceof CopyInstruction) {
    variables.add(instr.dest);
    variables.add(instr.src);

    // if (typeof instr.srcIndex === "string") {
    //   variables.add(instr.srcIndex);
    // }
    // if (typeof instr.destIndex === "string") {
    //   variables.add(instr.destIndex);
    // }
  } else if (instr instanceof BinOpInstruction) {
    variables.add(instr.dest);
    variables.add(instr.expr1);
    variables.add(instr.expr2);
  } else if (instr instanceof LoadConstantInstruction) {
    variables.add(instr.dest);
  } else if (instr instanceof CastInstruction) {
    variables.add(instr.dest);
    variables.add(instr.src);
  } else if (instr instanceof CallInstruction && instr.returnVar) {
    variables.add(instr.returnVar);
  } else if (instr instanceof CreateVarInstruction) {
    variables.add(instr.name);
  } else if (instr instanceof CreateArrayInstruction) {
    variables.add(instr.name);
  } else if (instr instanceof NegateInstruction) {
    variables.add(instr.src);
    variables.add(instr.dest);
  } else if (instr instanceof JumpBoolInstruction) {
    variables.add(instr.conditionVar);
  } else if (instr instanceof ReturnInstruction && instr.src) {
    variables.add(instr.src);
  }
}

function cleanupPhiFunctions(entryBlock: BasicBlock): void {
  const blocks = getCfgTree(entryBlock);

  for (const block of blocks) {
    block.phiInstructions = block.phiInstructions.filter((phi) => {
      const uniqueSources = new Set(phi.sources.values());
      return uniqueSources.size > 1;
    });
  }
}
