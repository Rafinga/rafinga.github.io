import { ArrayType, Datatype } from "../phase-2/semantics/datatype";
import {
  Program,
  Method,
  Statement,
  Expr,
  ArrNameExpr,
  NameExpr,
  CastExpr,
  LenExpr,
  BinExpr,
  MethodCallExpr,
  Assignment,
  IfElse,
  ForLoop,
  WhileLoop,
  Return,
  Break,
  Continue,
  NegativeExpr,
  CondOp,
  AndOp,
  OrOp,
  IntLiteral,
  LongLiteral,
  BoolLiteral,
  StringLiteral,
  NotExpr,
  IntCastExpr,
  LongCastExpr,
  Increment,
  ModuloAssign,
  DivideAssign,
  MultiplyAssign,
  MinusAssign,
  PlusAssign,
  Assign,
  PlusOp,
  MinusOp,
  MultiplyOp,
  DivideOp,
  IncrementOperator,
  ModuloOp,
} from "../phase-2/semantics/ir";
import { Scope } from "../phase-2/semantics/scope";
import { safeParseInt } from "../phase-4/utils";

import {
  BasicBlock,
  BinOpInstruction,
  CopyInstruction,
  LoadConstantInstruction,
  CallInstruction,
  Loop,
  ReturnInstruction,
  literalType,
  CastInstruction,
  JumpBoolInstruction,
  JumpDirectInstruction,
  CreateVarInstruction,
  CreateArrayInstruction,
  NegateInstruction,
  BranchBlocks,
} from "./cfgTypes";

export class ControlFlowGraph {
  private program: Program;
  private nextTempId: number;
  public orderedMethods: Array<string>;
  public orderedDataTypes: Array<Datatype> = [];
  private labelCounter: number;
  private scopeCounter: number;
  private curScope: number;
  private scopeRenames: Map<number, string[]> = new Map();
  private scopeParents: Map<number, number> = new Map();
  private instrWeight = 1;

  constructor(program: Program) {
    this.program = program;
    this.nextTempId = 0;
    //todo this is temporary, integrate better with method names for each top level basic block in the future
    this.orderedMethods = [];
    this.labelCounter = 0;
    this.scopeCounter = 1;
    this.curScope = 0;
    program.natives.forEach((dataType, name) => {
      this.addRename(-1, name);
    });
    this.scopeParents.set(0, -1);
  }

  private genPurgeArr(statements: Statement[]): boolean[] {
    let skipStatement = false;
    const skipStatements = statements.map((stmt) => {
      if (skipStatement) {
        return true;
      }
      if (stmt instanceof Continue || stmt instanceof Break) {
        skipStatement = true;
        return false;
      }
      return false;
    });
    return skipStatements;
  }

  public isGlobalVariable(key: string): boolean {
    return this.getGlobals().has(key);
  }
  private addRename(scope: number, name: string) {
    const nameUsed = scope === -1 ? name : `${name}_${scope}`;
    //so we don't redefine globals
    if (!this.scopeRenames.has(scope)) {
      this.scopeRenames.set(scope, []);
    }
    this.scopeRenames.get(scope)?.push(nameUsed);
  }

  private getRename(name: string): string {
    if (safeParseInt(name)) {
      return name;
    }
    let scope = this.curScope;
    let expectedRename = scope === -1 ? name : `${name}_${scope}`;
    while (!this.scopeRenames.get(scope)?.includes(expectedRename)) {
      scope = this.scopeParents.get(scope) as number;
      expectedRename = scope === -1 ? name : `${name}_${scope}`;
    }
    return expectedRename;
  }

  private clearRenames(): void {
    const globalNames = this.scopeRenames.get(-1) as string[];
    this.scopeRenames.clear();
    this.scopeRenames.set(-1, globalNames);
  }

  private getNextTempVar(): string {
    this.nextTempId += 1;
    return `t${this.nextTempId}`;
  }

  //takes in the entryBlock of each method ??? if each method has multple BasicBlocks
  public buildCFG(): Array<BasicBlock> {
    const controlFlowGraphs: Array<BasicBlock> = [];

    this.program.methods.forEach((method) => {
      method.params.ordered_params.forEach(([param, field], index) => {
        this.addRename(this.curScope, param);
        method.params.ordered_params[index][0] = this.getRename(param);
      });
      controlFlowGraphs.push(this.buildMethodCFG(method));
      this.orderedMethods.push(method.method_name);
      this.orderedDataTypes.push(method.returnType);
      this.clearRenames();
    });
    return controlFlowGraphs;
  }

  private buildFields(curBlock: BasicBlock, scope: Scope): void {
    scope.symbols.forEach((field) => {
      if (field.type instanceof ArrayType) {
        const size = field.type.array_size;
        curBlock.instructions.push(
          new CreateArrayInstruction(field.name, size, field.type)
        );
        return;
      }
      this.addRename(this.curScope, field.name);
      curBlock.instructions.push(
        new CreateVarInstruction(this.getRename(field.name), field.type)
      );
    });
  }

  public getGlobals(): Set<string> {
    const globals: Set<string> = new Set();
    for (const variable of this.program.natives.keys()) {
      globals.add(variable);
    }
    return globals;
  }

  //need to include children and predecessors if only returning entryBlock
  //currently dont have access to other blocks
  public buildMethodCFG(method: Method): BasicBlock {
    // tracks current block but outputs entry block
    const entryBlock = new BasicBlock(
      method.method_name,
      this.curScope,
      this.curScope,
      []
    );
    let curBlock = entryBlock;
    const fakeEntry = new BasicBlock("fakeEntry", -27, -27, []);
    this.addPredecessor(curBlock, fakeEntry);
    this.buildFields(curBlock, method.body.scope);
    method.params.ordered_params.forEach(([param, field], index) => {
      this.addRename(this.curScope, param);
    });
    // Process each statement, properly linking blocks
    method.body.statements.forEach((statement) => {
      curBlock = this.buildStatement(statement, curBlock, null, method);
    });
    entryBlock.popPredecessor(fakeEntry);

    return entryBlock;
  }

  public buildExpression(
    expr: Expr,
    curBlock: BasicBlock,
    method: Method
  ): [BasicBlock, string] {
    const folding = true;

    if (folding) {
      const newExpr = ControlFlowGraph.constantFold(expr);
      if (newExpr !== expr) {
        return this.buildExpression(newExpr, curBlock, method);
      }
    }

    if (expr instanceof NegativeExpr) {
      const dest = this.getNextTempVar();
      const negatedExpr = expr.expr;
      if (negatedExpr instanceof IntLiteral) {
        const negatedInstr = new LoadConstantInstruction(
          dest,
          (-negatedExpr.val).toString(),
          literalType.int
        );
        negatedInstr.weight = this.instrWeight;
        curBlock.instructions.push(negatedInstr);
        return [curBlock, dest];
      } else if (negatedExpr instanceof LongLiteral) {
        const negatedInstr = new LoadConstantInstruction(
          dest,
          (-negatedExpr.val).toString(),
          literalType.long
        );
        negatedInstr.weight = this.instrWeight;
        curBlock.instructions.push(negatedInstr);
        return [curBlock, dest];
      } else {
        let tempDest = "";
        [curBlock, tempDest] = this.buildExpression(
          expr.expr,
          curBlock,
          method
        );
        const negateInstr = new NegateInstruction(tempDest, dest);
        negateInstr.weight = this.instrWeight;
        curBlock.instructions.push(negateInstr);
      }
      return [curBlock, dest];
    } else if (expr instanceof NotExpr) {
      const dest = this.getNextTempVar();
      // const conditionalInstr = this.buildShortCircuit(expr, method, dest);
      // curBlock.instructions.push(conditionalInstr);
      // return [curBlock, dest];
      const shortCircuitBlock = this.buildShortCircuitBlocks(
        curBlock,
        expr,
        method,
        dest
      );
      return [shortCircuitBlock, dest];
    } else if (expr instanceof NameExpr) {
      this.getRename(expr.name);
      return [curBlock, this.getRename(expr.name)];
    } else if (expr instanceof ArrNameExpr) {
      const indexExpr = expr.expression;
      if (indexExpr instanceof IntLiteral) {
        const arrIndex = `${expr.name}[${indexExpr.val}]`;
        const indexDest = this.getNextTempVar();
        const copyInstr = new CopyInstruction(indexDest, arrIndex);
        copyInstr.weight = this.instrWeight;
        curBlock.instructions.push(copyInstr);
        return [curBlock, indexDest];
      }

      let indexDest: string;
      [curBlock, indexDest] = this.buildExpression(indexExpr, curBlock, method);

      const rightExprDest = this.getNextTempVar();
      const arraySrc = `${expr.name}[${indexDest}]`;
      const copyInstr = new CopyInstruction(rightExprDest, arraySrc);
      copyInstr.weight = this.instrWeight;
      curBlock.instructions.push(copyInstr);
      return [curBlock, rightExprDest];
    } else if (expr instanceof CastExpr) {
      const dest = this.getNextTempVar();
      const valToCast = expr.expr;
      const castType =
        expr instanceof IntCastExpr ? literalType.int : literalType.long;
      // Get the constant value directly from the expression if it's a literal
      if (valToCast instanceof IntLiteral || valToCast instanceof LongLiteral) {
        const constantValue = valToCast.val.toString();
        const constantInstr = new LoadConstantInstruction(
          dest,
          constantValue,
          castType
        );
        constantInstr.weight = this.instrWeight;
        curBlock.instructions.push(constantInstr);
      } else {
        // Handle non-literal casts
        let subExprVar: string;
        [curBlock, subExprVar] = this.buildExpression(
          valToCast,
          curBlock,
          method
        );
        const castInstr = new CastInstruction(dest, subExprVar, castType);
        castInstr.weight = this.instrWeight;
        curBlock.instructions.push(castInstr);
      }
      return [curBlock, dest];
    } else if (expr instanceof LenExpr) {
      const methodBodySymbols = method.body.scope.lookup(expr.name);
      if (
        !(methodBodySymbols instanceof ArrayType) ||
        methodBodySymbols.array_size === undefined
      ) {
        throw new Error("Could not find array length for " + expr.name);
      }

      const length = methodBodySymbols.array_size.toString();
      const dest = this.getNextTempVar();
      const loadInstr = new LoadConstantInstruction(
        dest,
        length,
        literalType.int
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);
      return [curBlock, dest];
    } else if (expr instanceof MethodCallExpr) {
      let args: Array<string | StringLiteral>;
      const callReturnVar = this.getNextTempVar();

      // Process all arguments
      [curBlock, args] = this.handleMethodCallArgs(expr.args, curBlock, method);

      const dest = callReturnVar;
      const callInstr = new CallInstruction(
        expr.methodName,
        args,
        callReturnVar
      );
      callInstr.weight = this.instrWeight;
      curBlock.instructions.push(callInstr);

      return [curBlock, dest];
    } else if (expr instanceof BinExpr) {
      const dest = this.getNextTempVar();
      // If it's a conditional operation
      if (expr.binOp instanceof CondOp) {
        const shortCircuitBlock = this.buildShortCircuitBlocks(
          curBlock,
          expr,
          method,
          dest
        );
        return [shortCircuitBlock, dest];
      } else {
        // For arithmetic operations, handle literals specially
        // Handle left-hand side literal
        let lhsBlock, rhsDest: string;
        let lhsDest, rhsBlock: BasicBlock;

        [lhsBlock, lhsDest] = this.buildExpression(
          expr.expr1,
          curBlock,
          method
        );

        [rhsBlock, rhsDest] = this.buildExpression(
          expr.expr2,
          lhsBlock,
          method
        );
        const binOpInstr = new BinOpInstruction(
          lhsDest,
          expr.binOp,
          rhsDest,
          dest
        );
        binOpInstr.weight = this.instrWeight;
        rhsBlock.instructions.push(binOpInstr);
        return [rhsBlock, dest];
      }
    } else if (expr instanceof IntLiteral) {
      const dest = this.getNextTempVar();
      const loadInstr = new LoadConstantInstruction(
        dest,
        expr.val.toString(),
        literalType.int
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);
      return [curBlock, dest];
    } else if (expr instanceof LongLiteral) {
      const dest = this.getNextTempVar();
      const loadInstr = new LoadConstantInstruction(
        dest,
        expr.val.toString(),
        literalType.long
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);
      return [curBlock, dest];
    } else if (expr instanceof BoolLiteral) {
      const dest = this.getNextTempVar();
      const boolLoad = expr.b ? "1" : "0";
      // In x86-64, booleans are labeled with 0 being false, 1 being true
      const loadInstr = new LoadConstantInstruction(
        dest,
        boolLoad,
        literalType.bool
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);

      return [curBlock, dest];
    }
    return [curBlock, this.getNextTempVar()];
  }

  public addBlockSuccessor(curBlock: BasicBlock, nextBlock: BasicBlock) {
    // avoid overriding blocks that either are not reachable anymore, or have been already
    // modified
    if (
      curBlock.joinSuccessor !== null ||
      curBlock.getPredecessors().length === 0
    ) {
      return;
    }
    curBlock.joinSuccessor = nextBlock;
    this.addPredecessor(nextBlock, curBlock);
  }

  public addPredecessor(curBlock: BasicBlock, predecessor: BasicBlock) {
    curBlock.mutPredecessors.add(predecessor.label);
    curBlock.mutPredecessorBlocks.push(predecessor);
  }
  private addBlockBranch(curBlock: BasicBlock, branchBlock: BranchBlocks) {
    const trueBlock = branchBlock.trueBlock;
    const falseBlock = branchBlock.falseBlock;
    curBlock.branchSuccessors = branchBlock;
    trueBlock.mutPredecessors.add(curBlock.label);
    trueBlock.mutPredecessorBlocks.push(curBlock);
    falseBlock.mutPredecessors.add(curBlock.label);
    falseBlock.mutPredecessorBlocks.push(curBlock);
    //this isn't used in the asm generator, but it is for the reg allocator
    const jumpInstr = new JumpBoolInstruction(
      branchBlock.conditionVar,
      curBlock.label,
      trueBlock.label,
      falseBlock.label
    );
    jumpInstr.weight = this.instrWeight;
    curBlock.instructions.push(jumpInstr);
  }

  private static bigIntToNumber(val: bigint): number {
    const isNegative = val < 0n;
    if (isNegative) {
      val = val * -1n;
      let temp = Number(val & 0xffffffffn);
      return -temp;
    }
    return Number(val & 0xffffffffn);
  }

  private static bigIntToLong(val: bigint): bigint {
    const isNegative = val < 0n;
    if (isNegative) {
      val = val * -1n;
      let temp = BigInt(val & 0xffffffffffffffffn);
      return -temp;
    }
    return BigInt(val & 0xffffffffffffffffn);
  }

  public static constantFold(expr: Expr): Expr {
    if (expr instanceof BinExpr) {
      const foldSpan = expr.span;
      const left = this.constantFold(expr.expr1);
      const right = this.constantFold(expr.expr2);
      let cond: boolean | null = null;
      if (left instanceof IntLiteral && right instanceof IntLiteral) {
        let calculation: bigint | null = null;
        switch (expr.binOp.toString()) {
          case "+":
            calculation = BigInt(left.val) + BigInt(right.val);
            break;
          case "-":
            calculation = BigInt(left.val) - BigInt(right.val);
            break;
          case "*":
            calculation = BigInt(left.val) * BigInt(right.val);
            break;
          case "/":
            if (right.val === 0) {
              break;
            }
            calculation = BigInt(left.val) / BigInt(right.val);
            break;
          case "%":
            if (right.val === 0) {
              break;
            }
            calculation = BigInt(left.val) % BigInt(right.val);
            break;
          case "<=":
            cond = BigInt(left.val) <= BigInt(right.val);
            break;
          case "<":
            cond = BigInt(left.val) < BigInt(right.val);
            break;
          case ">=":
            cond = BigInt(left.val) >= BigInt(right.val);
            break;
          case ">":
            cond = left.val > BigInt(right.val);
            break;
          case "==":
            cond = BigInt(left.val) === BigInt(right.val);
            break;
          case "!=":
            cond = BigInt(left.val) !== BigInt(right.val);
            break;
        }
        if (calculation !== null) {
          return new IntLiteral(this.bigIntToNumber(calculation), foldSpan);
        }
        if (cond !== null) {
          return new BoolLiteral(cond, foldSpan);
        }
        if (left === expr.expr1 && right === expr.expr2) {
          return expr;
        }
        return new BinExpr(left, expr.binOp, right, expr.span);
      } else if (left instanceof LongLiteral && right instanceof LongLiteral) {
        let calculation: bigint | null = null;
        switch (expr.binOp.toString()) {
          case "+":
            calculation = BigInt(left.val) + BigInt(right.val);
            break;
          case "-":
            calculation = BigInt(left.val) - BigInt(right.val);
            break;
          case "*":
            calculation = BigInt(left.val) * BigInt(right.val);
            break;
          case "/":
            if (right.val === 0n) {
              break;
            }
            calculation = BigInt(left.val) / BigInt(right.val);
            break;
          case "%":
            if (right.val === 0n) {
              break;
            }
            calculation = BigInt(left.val) % BigInt(right.val);
            break;
          case "<=":
            cond = BigInt(left.val) <= BigInt(right.val);
            break;
          case "<":
            cond = BigInt(left.val) < BigInt(right.val);
            break;
          case ">=":
            cond = BigInt(left.val) >= BigInt(right.val);
            break;
          case ">":
            cond = BigInt(left.val) > BigInt(right.val);
            break;
          case "==":
            cond = BigInt(left.val) === BigInt(right.val);
            break;
          case "!=":
            cond = BigInt(left.val) !== BigInt(right.val);
            break;
        }
        if (calculation !== null) {
          return new LongLiteral(this.bigIntToLong(calculation), foldSpan);
        }
        if (cond !== null) {
          return new BoolLiteral(cond, foldSpan);
        }
        if (left === expr.expr1 && right === expr.expr2) {
          return expr;
        }
        return new BinExpr(left, expr.binOp, right, expr.span);
      } else if (left instanceof BoolLiteral && right instanceof BoolLiteral) {
        switch (expr.binOp.toString()) {
          case "&&":
            return new BoolLiteral(left.b && right.b, foldSpan);
          case "||":
            return new BoolLiteral(left.b || right.b, foldSpan);
          case "==":
            return new BoolLiteral(left.b === right.b, foldSpan);
          case "!=":
            return new BoolLiteral(left.b !== right.b, foldSpan);
        }
        if (left === expr.expr1 && right === expr.expr2) {
          return expr;
        }
        return new BinExpr(left, expr.binOp, right, expr.span);
      }
    }
    if (expr instanceof NotExpr) {
      const foldSpan = expr.span;
      const expr1 = this.constantFold(expr.expr);
      if (expr1 instanceof BoolLiteral) {
        return new BoolLiteral(!expr1.b, foldSpan);
      }
      if (expr1 === expr.expr) {
        return expr;
      }
      return new NotExpr(expr1, expr.span);
    }

    if (expr instanceof IntCastExpr) {
      const foldSpan = expr.span;
      const expr1 = this.constantFold(expr.expr);

      if (expr1 instanceof IntLiteral) {
        return new IntLiteral(expr1.val, foldSpan);
      }
      if (expr1 instanceof LongLiteral) {
        return new IntLiteral(Number(expr1.val & 0xffffffffn), foldSpan);
      }
      if (expr1 === expr.expr) {
        return expr;
      }
      return new IntCastExpr(expr1, expr.span);
    }
    if (expr instanceof LongCastExpr) {
      const foldSpan = expr.span;
      const expr1 = this.constantFold(expr.expr);
      if (expr1 instanceof LongLiteral) {
        return new LongLiteral(expr1.val, foldSpan);
      }
      if (expr1 instanceof IntLiteral) {
        return new LongLiteral(BigInt(expr1.val), foldSpan);
      }
      if (expr1 === expr.expr) {
        return expr;
      }
      return new LongCastExpr(expr1, expr.span);
    }
    if (expr instanceof NegativeExpr) {
      const foldSpan = expr.span;
      const expr1 = this.constantFold(expr.expr);
      if (expr1 instanceof IntLiteral) {
        return new IntLiteral(-expr1.val, foldSpan);
      }
      if (expr1 instanceof LongLiteral) {
        return new LongLiteral(-expr1.val, foldSpan);
      }
      if (expr1 === expr.expr) {
        return expr;
      }
      return new NegativeExpr(expr1, expr.span);
    }

    if (expr instanceof IntLiteral) {
      return expr;
    }
    if (expr instanceof LongLiteral) {
      return expr;
    }
    if (expr instanceof BoolLiteral) {
      return expr;
    }
    return expr;
  }

  //returns join block at the end
  private buildShortCircuitBlocks(
    curBlock: BasicBlock,
    expr: Expr,
    method: Method,
    dest: string
  ): BasicBlock {
    const trueLabel = `labelT_${this.labelCounter}`;
    const loadInstr = new LoadConstantInstruction(dest, "1", literalType.bool);
    loadInstr.weight = this.instrWeight;
    const trueBlock = new BasicBlock(
      trueLabel,
      curBlock.curScope,
      curBlock.parentScope,
      [loadInstr]
    );
    const falseLoadInstr = new LoadConstantInstruction(
      dest,
      "0",
      literalType.bool
    );
    falseLoadInstr.weight = this.instrWeight;
    const falseLabel = `labelF_${this.labelCounter}`;
    const falseBlock = new BasicBlock(
      falseLabel,
      curBlock.curScope,
      curBlock.parentScope,
      [falseLoadInstr]
    );
    const endLabel = `end_${this.labelCounter}`;
    const endBlock = new BasicBlock(
      endLabel,
      curBlock.curScope,
      curBlock.parentScope,
      []
    );
    this.labelCounter++;

    this.buildConditional(expr, curBlock, trueBlock, falseBlock, method);
    this.addBlockSuccessor(trueBlock, endBlock);
    this.addBlockSuccessor(falseBlock, endBlock);
    return endBlock;
  }
  private buildConditional(
    expr: Expr,
    entryBlock: BasicBlock,
    trueBlock: BasicBlock,
    falseBlock: BasicBlock,
    method: Method
  ): void {
    const scope = entryBlock.curScope;
    const parentScope = entryBlock.parentScope;
    if (expr instanceof BinExpr && expr.binOp instanceof AndOp) {
      const statement2Start = `shortCircuitT_${this.labelCounter++}`;
      const shortCircuitBlock = new BasicBlock(
        statement2Start,
        scope,
        parentScope,
        []
      );
      this.buildConditional(
        expr.expr1,
        entryBlock,
        shortCircuitBlock,
        falseBlock,
        method
      );

      this.buildConditional(
        expr.expr2,
        shortCircuitBlock,
        trueBlock,
        falseBlock,
        method
      );
      return;
    }
    if (expr instanceof BinExpr && expr.binOp instanceof OrOp) {
      const statement2Start = `shortCircuitF_${this.labelCounter++}`;
      const shortCircuitBlock = new BasicBlock(
        statement2Start,
        scope,
        parentScope,
        []
      );
      this.buildConditional(
        expr.expr1,
        entryBlock,
        trueBlock,
        shortCircuitBlock,
        method
      );
      this.buildConditional(
        expr.expr2,
        shortCircuitBlock,
        trueBlock,
        falseBlock,
        method
      );
      return;
    }
    if (expr instanceof NotExpr) {
      this.buildConditional(
        expr.expr,
        entryBlock,
        falseBlock,
        trueBlock,
        method
      );
      return;
    }

    const [curBlock, dest] = this.buildExpression(expr, entryBlock, method);
    const branchBlock = new BranchBlocks(dest, trueBlock, falseBlock);
    this.addBlockBranch(curBlock, branchBlock);
  }

  public buildStatement(
    stmt: Statement,
    curBlock: BasicBlock,
    loop: Loop | null,
    method: Method
  ): BasicBlock {
    if (stmt instanceof Assignment) {
      curBlock = this.handleAssignment(stmt, curBlock, method);
      return curBlock;
    } else if (stmt instanceof MethodCallExpr) {
      const [sameBlock, argTemps] = this.handleMethodCallArgs(
        stmt.args,
        curBlock,
        method
      );
      const callInstr = new CallInstruction(stmt.methodName, argTemps);
      callInstr.weight = this.instrWeight;
      sameBlock.instructions.push(callInstr);
      return sameBlock;
    } else if (stmt instanceof IfElse) {
      const condDest = this.getNextTempVar();
      const shortCircuitBlock = this.buildShortCircuitBlocks(
        curBlock,
        stmt.condition,
        method,
        condDest
      );

      const exprTLabel = `exprT_${this.labelCounter}`;
      const exprFLabel = `exprF_${this.labelCounter}`;
      const endLabel = `end_${this.labelCounter}`;
      const sourceScope = this.curScope;
      const trueScope = this.scopeCounter++;
      const falseScope = this.scopeCounter++;
      this.scopeParents.set(trueScope, sourceScope);
      this.scopeParents.set(falseScope, sourceScope);
      this.labelCounter++;
      let curTrueBlock = new BasicBlock(exprTLabel, trueScope, sourceScope, []);
      let curFalseBlock = new BasicBlock(
        exprFLabel,
        falseScope,
        sourceScope,
        []
      );
      const ifBranches = new BranchBlocks(
        condDest,
        curTrueBlock,
        curFalseBlock
      );
      this.addBlockBranch(shortCircuitBlock, ifBranches);
      if (stmt.falseBody) {
        const skipFalseStatements = this.genPurgeArr(stmt.falseBody.statements);
        this.curScope = falseScope;
        this.buildFields(curFalseBlock, stmt.falseBody.scope);
        stmt.falseBody.statements
          .filter((_, i) => !skipFalseStatements[i])
          .forEach((stmt) => {
            curFalseBlock = this.buildStatement(
              stmt,
              curFalseBlock,
              loop,
              method
            );
          });
      }
      this.curScope = trueScope;
      const skipTrueStatements = this.genPurgeArr(stmt.trueBody.statements);
      this.buildFields(curTrueBlock, stmt.trueBody.scope);
      stmt.trueBody.statements
        .filter((_, i) => !skipTrueStatements[i])
        .forEach((stmt) => {
          curTrueBlock = this.buildStatement(stmt, curTrueBlock, loop, method);
        });
      this.curScope = sourceScope;
      const endBlock = new BasicBlock(endLabel, sourceScope, sourceScope, []);
      this.addBlockSuccessor(curTrueBlock, endBlock);
      this.addBlockSuccessor(curFalseBlock, endBlock);
      return endBlock;
    } else if (stmt instanceof ForLoop) {
      curBlock = this.buildStatement(stmt.init, curBlock, loop, method); // check if should be build assignment
      this.instrWeight *= 100;
      const condDest = this.getNextTempVar();
      const headerLabel = `for_${this.labelCounter}`;
      const exprTLabel = `forT_${this.labelCounter}`;
      const exprFLabel = `forF_${this.labelCounter}`;
      const updateLabel = `update_${this.labelCounter}`;
      this.labelCounter++;
      // Create header block for loop entry point
      const parentScope = curBlock.parentScope;
      const sourceScope = this.curScope;
      const trueScope = this.scopeCounter++;
      this.scopeParents.set(trueScope, sourceScope);
      const headerBlock = new BasicBlock(
        headerLabel,
        sourceScope,
        parentScope,
        []
      );
      this.addBlockSuccessor(curBlock, headerBlock);
      const shortCircuitBlock = this.buildShortCircuitBlocks(
        headerBlock,
        stmt.condition,
        method,
        condDest
      );
      let curTrueBlock: BasicBlock = new BasicBlock(
        exprTLabel,
        trueScope,
        sourceScope,
        []
      );
      const endBlock = new BasicBlock(exprFLabel, sourceScope, sourceScope, []);
      const forBranches = new BranchBlocks(condDest, curTrueBlock, endBlock);
      this.addBlockBranch(shortCircuitBlock, forBranches);
      const updateBlock = new BasicBlock(
        updateLabel,
        sourceScope,
        parentScope,
        []
      );
      this.handleAssignment(stmt.update, updateBlock, method);
      this.curScope = trueScope;
      this.buildFields(curTrueBlock, stmt.body.scope);
      const newLoop = new Loop(endBlock, updateBlock);
      const skipStatements = this.genPurgeArr(stmt.body.statements);
      stmt.body.statements
        .filter((_, i) => !skipStatements[i])
        .forEach((stmt) => {
          curTrueBlock = this.buildStatement(
            stmt,
            curTrueBlock,
            newLoop,
            method
          );
        });
      this.curScope = sourceScope;

      const jumpBlock = new BasicBlock(
        `skip_${this.labelCounter++}`,
        sourceScope,
        sourceScope,
        []
      );
      this.addBlockSuccessor(curTrueBlock, updateBlock);
      this.addBlockSuccessor(updateBlock, jumpBlock);
      this.addBlockSuccessor(jumpBlock, headerBlock);
      this.instrWeight /= 100;
      return endBlock;
    } else if (stmt instanceof WhileLoop) {
      this.instrWeight *= 100;
      const condDest = this.getNextTempVar();

      const whileLabel = `while_${this.labelCounter}`;
      const exprTLabel = `whileT_${this.labelCounter}`;
      const exprFLabel = `whileF_${this.labelCounter}`;
      this.labelCounter++;

      const sourceScope = this.curScope;
      const trueScope = this.scopeCounter++;
      this.scopeParents.set(trueScope, sourceScope);

      const whileHeader = new BasicBlock(
        whileLabel,
        sourceScope,
        curBlock.parentScope,
        []
      );
      this.addBlockSuccessor(curBlock, whileHeader);

      const shortCircuitBlock = this.buildShortCircuitBlocks(
        whileHeader,
        stmt.condition,
        method,
        condDest
      );

      let curTrueBlock = new BasicBlock(exprTLabel, trueScope, sourceScope, []);
      const endBlock = new BasicBlock(exprFLabel, sourceScope, sourceScope, []);
      const whileBranches = new BranchBlocks(condDest, curTrueBlock, endBlock);
      this.addBlockBranch(shortCircuitBlock, whileBranches);
      const jumpBlock = new BasicBlock(
        `skip_${this.labelCounter++}`,
        sourceScope,
        sourceScope,
        []
      );
      const newLoop = new Loop(endBlock, jumpBlock);
      this.curScope = trueScope;
      this.buildFields(curTrueBlock, stmt.body.scope);
      const skipStatements = this.genPurgeArr(stmt.body.statements);
      stmt.body.statements
        .filter((_, i) => !skipStatements[i])
        .forEach((stmt) => {
          curTrueBlock = this.buildStatement(
            stmt,
            curTrueBlock,
            newLoop,
            method
          );
        });
      this.curScope = sourceScope;

      this.addBlockSuccessor(curTrueBlock, jumpBlock);
      this.addBlockSuccessor(jumpBlock, whileHeader);
      this.instrWeight /= 100;
      return endBlock;
    } else if (stmt instanceof Return) {
      let retTemp: string;
      if (stmt.expr) {
        [curBlock, retTemp] = this.buildExpression(stmt.expr, curBlock, method);
        const retInstr = new ReturnInstruction(retTemp); //only return 1 time so no need to change weight
        curBlock.instructions.push(retInstr);
        return curBlock;
      } else {
        const nullRetInstr = new ReturnInstruction(null);
        curBlock.instructions.push(nullRetInstr);
        return curBlock;
      }
    } else if (stmt instanceof Break) {
      if (loop) {
        this.addBlockSuccessor(curBlock, loop.breakTo);
      }
      return curBlock;
    } else if (stmt instanceof Continue) {
      if (loop) {
        this.addBlockSuccessor(curBlock, loop.continueTo);
      }
      return curBlock;
    } else {
      throw new Error("Statement type does not exist.");
    }
  }

  private handleAssignment(
    stmt: Assignment,
    curBlock: BasicBlock,
    method: Method
  ): BasicBlock {
    let leftExprDest; // this is the final destination of the left expression
    let arrayIndex = null;

    // Handle the left side
    if (stmt.lhsIndexed) {
      // This is an array assignment
      leftExprDest = stmt.lhsIndexed[0] as string;
      let lhsArrayIndexExpr = stmt.lhsIndexed[1];

      if (lhsArrayIndexExpr instanceof IntLiteral) {
        arrayIndex = lhsArrayIndexExpr.val;
      } else {
        [curBlock, arrayIndex] = this.buildExpression(
          stmt.lhsIndexed[1],
          curBlock,
          method
        );
      }
      leftExprDest = `${leftExprDest}[${arrayIndex}]`;
    } else {
      leftExprDest = this.getRename(stmt.lhsUnindexed as string);
    }

    // First handle the right side expression
    // The idea is that we want to load the right side expression into a temp variable (rightExprDest)
    let rightExprDest;
    if (
      stmt.rhs.expr instanceof IntLiteral ||
      stmt.rhs.expr instanceof LongLiteral
    ) {
      // we first load the constant into a temp variable
      rightExprDest = this.getNextTempVar();
      let type =
        stmt.rhs.expr instanceof IntLiteral
          ? literalType.int
          : literalType.long;
      const loadInstr = new LoadConstantInstruction(
        rightExprDest,
        stmt.rhs.expr.val.toString(),
        type
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);
    } else if (stmt.rhs.expr instanceof BoolLiteral) {
      rightExprDest = this.getNextTempVar();
      const loadInstr = new LoadConstantInstruction(
        rightExprDest,
        stmt.rhs.expr.b ? "1" : "0",
        literalType.bool
      );
      loadInstr.weight = this.instrWeight;
      curBlock.instructions.push(loadInstr);
      // new somebody else please confirm :pray:
    } else if (stmt.rhs.expr instanceof MethodCallExpr) {
      let argTemps: Array<string | StringLiteral> = [];
      [curBlock, argTemps] = this.handleMethodCallArgs(
        stmt.rhs.expr.args,
        curBlock,
        method
      );
      rightExprDest = this.getNextTempVar();
      const callInstr = new CallInstruction(
        stmt.rhs.expr.methodName,
        argTemps,
        rightExprDest
      );
      callInstr.weight = this.instrWeight;
      curBlock.instructions.push(callInstr);
    } else if (stmt.rhs.operator instanceof IncrementOperator) {
      let one = this.getNextTempVar();
      if (stmt.rhs.operator instanceof Increment) {
        if (stmt.rhs.isLong) {
          const loadInstr = new LoadConstantInstruction(
            one,
            "1",
            literalType.long
          );
          loadInstr.weight = this.instrWeight;
          curBlock.instructions.push(loadInstr);
        } else {
          const loadInstr = new LoadConstantInstruction(
            one,
            "1",
            literalType.int
          );
          loadInstr.weight = this.instrWeight;
          curBlock.instructions.push(loadInstr);
        }
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new PlusOp(),
          one,
          leftExprDest
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
        return curBlock;
      } else {
        // decrement
        if (stmt.rhs.isLong) {
          const loadInstr = new LoadConstantInstruction(
            one,
            "1",
            literalType.long
          );
          loadInstr.weight = this.instrWeight;
          curBlock.instructions.push(loadInstr);
        } else {
          const loadInstr = new LoadConstantInstruction(
            one,
            "1",
            literalType.int
          );
          loadInstr.weight = this.instrWeight;
          curBlock.instructions.push(loadInstr);
        }
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new MinusOp(),
          one,
          leftExprDest
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
        return curBlock;
      }
    } else {
      [curBlock, rightExprDest] = this.buildExpression(
        stmt.rhs.expr,
        curBlock,
        method
      );
    }

    // For non-simple assignments (+=, -=, etc.), we need to load the original value first
    if (
      !(
        stmt.rhs.operator instanceof Assign ||
        stmt.rhs.operator instanceof IncrementOperator
      )
    ) {
      // Create a temp variable for the result of the operation
      const resultTemp = this.getNextTempVar();

      // Handle different assignment operators
      if (stmt.rhs.operator instanceof PlusAssign) {
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new PlusOp(),
          rightExprDest,
          resultTemp
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
      } else if (stmt.rhs.operator instanceof MinusAssign) {
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new MinusOp(),
          rightExprDest,
          resultTemp
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
      } else if (stmt.rhs.operator instanceof MultiplyAssign) {
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new MultiplyOp(),
          rightExprDest,
          resultTemp
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
      } else if (stmt.rhs.operator instanceof DivideAssign) {
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new DivideOp(),
          rightExprDest,
          resultTemp
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
      } else if (stmt.rhs.operator instanceof ModuloAssign) {
        const binInstr = new BinOpInstruction(
          leftExprDest,
          new ModuloOp(),
          rightExprDest,
          resultTemp
        );
        binInstr.weight = this.instrWeight;
        curBlock.instructions.push(binInstr);
      }

      // Now store the result
      const copyInstr = new CopyInstruction(leftExprDest, resultTemp);
      copyInstr.weight = this.instrWeight;
      curBlock.instructions.push(copyInstr);
    } else {
      // Simple assignment (=)
      const copyInstr = new CopyInstruction(leftExprDest, rightExprDest);
      copyInstr.weight = this.instrWeight;
      curBlock.instructions.push(copyInstr);
    }
    return curBlock;
  }

  private handleMethodCallArgs(
    args: (MethodCallExpr | Expr | StringLiteral)[],
    curBlock: BasicBlock,
    method: Method
  ): [BasicBlock, Array<string | StringLiteral>] {
    let argTemps: Array<string | StringLiteral> = [];
    for (const arg of args) {
      let argTemp: string | StringLiteral = "";
      if (arg instanceof IntLiteral) {
        argTemp = arg.val.toString();
      } else if (arg instanceof LongLiteral) {
        argTemp = arg.val.toString() + "L";
      } else if (arg instanceof BoolLiteral) {
        argTemp = arg.b ? "1b" : "0b";
      } else if (arg instanceof StringLiteral) {
        argTemp = arg; //hacky last minute solution. Fix later
      } else {
        [curBlock, argTemp] = this.buildExpression(arg, curBlock, method);
      }
      argTemps.push(argTemp);
    }
    return [curBlock, argTemps];
  }

  public toDot(methodName: string): string {
    const visited = new Set<BasicBlock>();
    const blockIds = new Map<BasicBlock, number>();
    let nextId = 0;

    // Helper function to get/assign unique IDs to blocks
    const getBlockId = (block: BasicBlock): number => {
      if (!blockIds.has(block)) {
        blockIds.set(block, nextId++);
      }
      return blockIds.get(block)!;
    };

    // Helper function to format instructions as string
    const formatInstructions = (block: BasicBlock): string => {
      return block.instructions
        .map((instr) => {
          let str = instr.toString();
          // Escape special characters for DOT format
          str = str
            .replace(/\\/g, "\\\\") // Escape backslashes first
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/"/g, '\\"'); // Escape quotes
          return str;
        })
        .join("\\n");
    };

    // Helper function for DFS traversal and DOT generation
    const generateDot = (block: BasicBlock): string[] => {
      if (visited.has(block)) {
        return [];
      }
      visited.add(block);

      const lines: string[] = [];
      const blockId = getBlockId(block);

      // Add node definition
      lines.push(
        `    block${blockId} [shape=box, label="${formatInstructions(block)}"];`
      );

      // Add edges based on instruction types
      for (const instr of block.instructions) {
        if (instr instanceof JumpBoolInstruction) {
          // For conditional jumps to labels
          lines.push(
            `    block${blockId} -> ${instr.trueLabel} [label="true"];`
          );
          lines.push(
            `    block${blockId} -> ${instr.falseLabel} [label="false"];`
          );
        } else if (instr instanceof JumpDirectInstruction) {
          // For direct unconditional jumps
          lines.push(`    block${blockId} -> ${instr.label} [label="jump"];`);
        }
      }

      return lines;
    };
    const methodCFG = this.buildMethodCFG(
      this.program.methods.get(methodName)!
    );
    // Generate the complete DOT representation
    const dotLines = [
      `digraph ${methodName} {`,
      '    node [fontname="Courier"];',
      '    edge [fontname="Courier"];',
      ...generateDot(methodCFG),
      "}",
    ];

    return dotLines.join("\n");
  }
}
