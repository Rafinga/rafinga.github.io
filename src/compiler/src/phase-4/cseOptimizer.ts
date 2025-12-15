import { utils } from "mocha";
import { ControlFlowGraph } from "../phase-3/cfg";
import {
  BasicBlock,
  BinOpInstruction,
  CopyInstruction,
  Instruction,
  CallInstruction,
  literalType,
  CastInstruction,
} from "../phase-3/cfgTypes";
import { areSetsEqual, setPop, setUnion } from "./utils";
import { BinExpr, StringLiteral } from "../phase-2/semantics/ir";

/**
 * Container for tracking expressions in available expressions analysis
 */
//currently only implemented for binary op instructions
export class ExprContainer {
  public renamed: boolean = false;
  constructor(
    public expr1: string,
    public binOp: any,
    public expr2: string,
    public result: string
  ) { }

  /**
   * Generate a unique signature for this expression
   */
  public getSignature(): string {
    return `${this.expr1}${this.binOp.toString()}${this.expr2}`;
  }

  /**
   * Check if this expression uses a given variable
   */
  public usesVar(varName: string): boolean {
    return this.expr1 === varName || this.expr2 === varName;
  }

  /**
   * Check if this expression matches a given signature
   */
  public matches(signature: string): boolean {
    return this.getSignature() === signature;
  }

  /**
   * Get all variables used in this expression
   */
  public getUsedVars(): string[] {
    return [this.expr1, this.expr2];
  }
}

/**
 * Container for tracking cast expressions in available expressions analysis
 */
export class CastExprContainer {
  constructor(
    public expr: string,
    public type: literalType,
    public result: string
  ) { }

  public getSignature(): string {
    return `cast(${this.expr},${this.type})`;
  }

  public usesVar(varName: string): boolean {
    return this.expr === varName;
  }

  public getUsedVars(): string[] {
    return [this.expr];
  }
}

/**
 * Container for tracking cast expressions in available expressions analysis
 */
export class methodCallContainer {
  constructor(
    public methodName: string,
    public args: (string | StringLiteral)[],
    public result: string | null
  ) { }

  public getSignature(): string {
    return `${this.methodName}(${this.args.join(",")})`;
  }

  public usesVar(varName: string): boolean {
    return this.args.includes(varName);
  }

  public getUsedVars(): string[] {
    return [...this.args.map((arg) => arg.toString())];
  }
}
/**
 * Common Subexpression Elimination optimizer using Available Expressions
 * with enhanced global optimization capabilities
 */
export class CseOptimizer {
  // Track global expressions across methods
  // Track which expressions are safe to optimize globally
  private counter = -1;

  constructor(
    private program: ControlFlowGraph,
    private localMethodSet: Set<string>
  ) { }
  private getNewCseName(): string {
    this.counter++;
    return `cse_${this.counter}`;
  }

  /**
   * Main entry point for Common Subexpression Elimination
   * Returns true if any changes were made, false otherwise
   */
  public eliminateCommonSubexpressions(blocks: Array<BasicBlock>): boolean {
    // Initialize available expression sets for each block
    blocks.forEach((block) => {
      block.aeIn = new Set();
      block.aeOut = new Set();
    });

    // First block has no expressions available at entry except safe global expressions
    const firstBlock = blocks[0];
    // firstBlock.aeIn = this.getSafeGlobalExpressions();

    // Compute initial gen set for first block
    // firstBlock.aeOut = setUnion(
    //   this.getGeneratedExpressions(firstBlock),
    //   this.getSurvivingExpressions(firstBlock.aeIn, firstBlock)
    // );
    firstBlock.aeOut = this.getGeneratedExpressions(firstBlock);

    // Initialize worklist with all blocks except the first one
    const changed: Set<BasicBlock> = new Set(
      blocks.filter((block) => block.label !== firstBlock.label)
    );

    // Iterative dataflow analysis to compute available expressions
    while (changed.size > 0) {
      const block: BasicBlock = setPop(changed);

      // Save the old OUT set for comparison
      const oldOut = new Set(block.aeOut);

      // IN[n] = ∩ OUT[p] for all predecessors p
      block.aeIn = this.intersectPredecessorAE(block);

      // OUT[n] = GEN[n] ∪ (IN[n] - KILL[n])
      const generatedExpr = this.getGeneratedExpressions(block);
      const survivingExpr = this.getSurvivingExpressions(block.aeIn, block);

      block.aeOut = setUnion(generatedExpr, survivingExpr);

      // If OUT has changed, add all successors to the worklist
      if (!areSetsEqual(oldOut, block.aeOut)) {
        block.getSuccessors().forEach((succ) => changed.add(succ));
      }
    }

    // // After method analysis, update global expressions with safe ones
    // this.updateGlobalExpressions(blocks);

    // Replace redundant expressions
    let hasChanged = false;

    blocks.forEach((block) => {
      this.modifyPredecessors(block);
      hasChanged = this.replaceRedundantExpressions(block);
    });
    return hasChanged;
  }
  // when copying over expressions from parent blocks we need to make sure we are considering all possible
  // variable names storage

  private modifyPredecessors(curBlock: BasicBlock): void {
    const predecessors = curBlock.getPredecessors();
    const aeContainers = curBlock.aeIn;
    const redefMap = new Map<string, string>();
    const containerWeights = new Map<string, number>();
    const usedContainers = new Set(
      [...aeContainers].filter(
        (container) => container instanceof ExprContainer
      )
    );
    usedContainers.forEach((container) => {
      if (container.renamed) return;
      container.result = this.getNewCseName();
      container.renamed = true;
      redefMap.set(container.getSignature(), container.result);
    });
    predecessors.forEach((pred) => {
      const prevContainers = pred.instructions
        .filter((instr) => instr instanceof BinOpInstruction)
        .map((instr) => {
          if (!(instr instanceof BinOpInstruction)) {
            throw new Error("instr is not BinOpInstruction");
          }
          const newContainer = new ExprContainer(
            instr.expr1,
            instr.binOp,
            instr.expr2,
            instr.dest
          );
          containerWeights.set(newContainer.getSignature(), instr.weight);
          return newContainer;
        });

      prevContainers.forEach((container) => {
        if (redefMap.has(container.getSignature())) {
          const cseVar = redefMap.get(container.getSignature());
          if (cseVar === undefined) {
            throw new Error("cseVar is undefined");
          }
          const copyOver = new CopyInstruction(cseVar, container.result);
          copyOver.weight = containerWeights.get(container.getSignature())!;
          pred.instructions.push(copyOver);
        }
      });
    });
  }

  /**
   * Compute the intersection of all predecessor OUT sets
   */
  private intersectPredecessorAE(block: BasicBlock): Set<ExprContainer> {
    const preds = block.getPredecessors();

    // For multiple predecessors, compute the intersection
    const signatures = new Map<string, ExprContainer[]>();

    // Collect expressions from all predecessors by signature
    preds.forEach((pred) => {
      pred.aeOut.forEach((expr) => {
        const sig = expr.getSignature();
        if (!signatures.has(sig)) {
          signatures.set(sig, []);
        }
        signatures.get(sig)!.push(expr);
      });
    });

    // Only keep expressions that appear in all predecessors
    const result = new Set<ExprContainer>();
    const signatureValues = [...signatures.values()];
    signatureValues
      .filter((exprs) => exprs.length === preds.length)
      .forEach((expr) => {
        result.add(expr[0]);
      });

    return result;
  }

  /**
   * Get expressions generated in this block
   */
  private getGeneratedExpressions(block: BasicBlock): Set<any> {
    // Using 'any' to handle different container types
    const generated = new Set<any>();
    const killed = new Set<string>();
    let breakEquiv = false;
    block.instructions.reverse().forEach((instr) => {
      if (breakEquiv) {
        return;
      }
      // Handle binary operations for CSE
      const dest = instr.getDest();
      if (instr instanceof BinOpInstruction) {
        // Skip expressions where operands have been killed earlier in the block
        if (killed.has(instr.expr1) || killed.has(instr.expr2)) {
          return;
        }
        const expr = new ExprContainer(
          instr.expr1,
          instr.binOp,
          instr.expr2,
          instr.dest
        );
        generated.add(expr);
      }

      // Handle cast operations
      else if (instr instanceof CastInstruction) {
        if (killed.has(instr.src)) {
          return;
        }
        const expr = new CastExprContainer(
          instr.src,
          instr.castType,
          instr.dest
        );
        generated.add(expr);
      } else if (instr instanceof CallInstruction) {
        if (!this.localMethodSet.has(instr.methodName)) {
          breakEquiv = true;
          return;
        }
        const expr = new methodCallContainer(
          instr.methodName,
          instr.args,
          instr.returnVar ? instr.returnVar : null
        );
        generated.add(expr);
      }
      if (dest !== null) killed.add(dest);
    });

    block.instructions.reverse();
    return generated;
  }

  /**
   * Get expressions from IN that survive (aren't killed) in this block
   */
  private getSurvivingExpressions(
    inSet: Set<any>, // Using 'any' to handle different container types
    block: BasicBlock
  ): Set<any> {
    const killed = new Set<string>();

    // Find all variables that are redefined in this block
    block.instructions.forEach((instr) => {
      const dest = instr.getDest();
      if (dest) killed.add(dest);
    });

    // Keep expressions that don't use any killed variables
    const result = new Set<any>();

    inSet.forEach((expr) => {
      // Handle different expression types accordingly
      if (expr instanceof ExprContainer) {
        if (!killed.has(expr.expr1) && !killed.has(expr.expr2)) {
          result.add(expr);
        }
      } else if (expr instanceof CastExprContainer) {
        if (!killed.has(expr.expr)) {
          result.add(expr);
        }
      }
    });

    return result;
  }

  /**
   * Replace redundant expressions with copies of existing results
   * Enhanced to handle multiple expression types, global expressions and function calls
   */
  private replaceRedundantExpressions(block: BasicBlock): boolean {
    let changesMade = false;

    // Track available expressions at each point in the block
    // Include safe global expressions in the initial available expressions
    let availableExprs = new Set<any>([...block.aeIn]);

    // Maps for different expression types - signature to result variable
    let binaryExprMap = new Map<string, string>();
    let castExprMap = new Map<string, string>();
    let methodCallMap = new Map<string, string>();

    // Build maps of expression signatures to result variables
    availableExprs.forEach((expr) => {
      const sig = expr.getSignature();
      if (expr instanceof ExprContainer) {
        binaryExprMap.set(sig, expr.result);
      } else if (expr instanceof CastExprContainer) {
        castExprMap.set(sig, expr.result);
      } else if (expr instanceof methodCallContainer) {
        if (expr.result === null) {
          return;
        }
        methodCallMap.set(sig, expr.result);
      }
    });

    // Process each instruction
    const newInstructions: Instruction[] = [];

    for (let i = 0; i < block.instructions.length; i++) {
      const instr = block.instructions[i];

      // Handle function calls - they can modify global variables
      if (instr instanceof CallInstruction) {
        if (!this.localMethodSet.has(instr.methodName)) {
          // After a function call, clear ALL expression maps for safety
          availableExprs = new Set<any>();
          binaryExprMap = new Map<string, string>();
          castExprMap = new Map<string, string>();
          methodCallMap = new Map<string, string>();

          // Keep the function call instruction
          newInstructions.push(instr);
          continue;
        }
        const callSignature = `${instr.methodName}(${instr.args.join(",")})`;

        if (
          methodCallMap.has(callSignature) &&
          methodCallMap.get(callSignature) !== instr.returnVar
        ) {
          const sourceVar = methodCallMap.get(callSignature)!;
          if (instr.returnVar) {
            newInstructions.push(
              new CopyInstruction(instr.returnVar, sourceVar)
            );
          }
          changesMade = true;
        } else {
          newInstructions.push(instr);
          if (instr.returnVar !== undefined) {
            const expr = new methodCallContainer(
              instr.methodName,
              instr.args,
              instr.returnVar
            );
            availableExprs.add(expr);
            methodCallMap.set(callSignature, instr.returnVar);
          }
        }
      }

      // Handle binary operations
      else if (instr instanceof BinOpInstruction) {
        const exprSignature = `${instr.expr1}${instr.binOp.toString()}${instr.expr2
          }`;

        // Check if this expression is already available
        if (
          binaryExprMap.has(exprSignature) &&
          binaryExprMap.get(exprSignature) !== instr.dest
        ) {
          // Replace with a copy instruction from the existing result
          const sourceVar = binaryExprMap.get(exprSignature)!;
          newInstructions.push(new CopyInstruction(instr.dest, sourceVar));
          changesMade = true;
        } else {
          // Keep the original instruction
          newInstructions.push(instr);

          // Add to available expressions
          const expr = new ExprContainer(
            instr.expr1,
            instr.binOp,
            instr.expr2,
            instr.dest
          );
          availableExprs.add(expr);
          binaryExprMap.set(exprSignature, instr.dest);
        }
      }
      // Handle cast operations
      else if (instr instanceof CastInstruction) {
        const exprSignature = `cast(${instr.src},${instr.castType})`;

        // Check if this expression is already available
        if (
          castExprMap.has(exprSignature) &&
          castExprMap.get(exprSignature) !== instr.dest
        ) {
          // Replace with a copy instruction from the existing result
          const sourceVar = castExprMap.get(exprSignature)!;
          newInstructions.push(new CopyInstruction(instr.dest, sourceVar));
          changesMade = true;
        } else {
          // Keep the original instruction
          newInstructions.push(instr);

          // Add to available expressions
          const expr = new CastExprContainer(
            instr.src,
            instr.castType,
            instr.dest
          );
          availableExprs.add(expr);
          castExprMap.set(exprSignature, instr.dest);
        }
      } else {
        // For other instructions, keep them and update available expressions
        newInstructions.push(instr);
      }
      // If this instruction defines a variable, update available expressions
      const dest = instr.getDest();
      if (dest) {
        this.updateExpressionMapsForNewDefinition(
          dest,
          availableExprs,
          binaryExprMap,
          castExprMap
        );
      }
    }

    // Update the block with optimized instructions
    block.instructions = newInstructions;

    return changesMade;
  }

  /**
   * Helper method to update expression maps when a variable is redefined
   */
  private updateExpressionMapsForNewDefinition(
    dest: string,
    availableExprs: Set<any>,
    binaryExprMap: Map<string, string>,
    castExprMap: Map<string, string>
  ): void {
    // Remove expressions that use the modified variable
    const updatedExprs = new Set<any>();

    // Track expressions to remove from maps
    const binaryToRemove: string[] = [];
    const castToRemove: string[] = [];

    availableExprs.forEach((expr) => {
      const sig = expr.getSignature();

      if (expr instanceof ExprContainer) {
        if (!expr.usesVar(dest)) {
          updatedExprs.add(expr);
        } else {
          binaryToRemove.push(sig);
        }
      } else if (expr instanceof CastExprContainer) {
        if (!expr.usesVar(dest)) {
          updatedExprs.add(expr);
        } else {
          castToRemove.push(sig);
        }
      }
    });

    // Update the available expressions set
    availableExprs.clear();
    updatedExprs.forEach((expr) => availableExprs.add(expr));

    // Remove invalidated expressions from maps
    binaryToRemove.forEach((sig) => binaryExprMap.delete(sig));
    castToRemove.forEach((sig) => castExprMap.delete(sig));
  }
}
