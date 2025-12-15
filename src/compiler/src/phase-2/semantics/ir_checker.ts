import {
  Program,
  Block,
  Method,
  Import,
  Statement,
  Expr,
  ArrNameExpr,
  NameExpr,
  CastExpr,
  LongCastExpr,
  IntCastExpr,
  LenExpr,
  BinExpr,
  NotExpr,
  MethodCallExpr,
  StringLiteral,
  LongLiteral,
  IntLiteral,
  BoolLiteral,
  Assignment,
  Assign,
  Increment,
  IfElse,
  ForLoop,
  WhileLoop,
  Return,
  Break,
  Continue,
  NegativeExpr,
  Field,
  EqOp,
  CondOp,
  ArithOp,
  RelationOp,
  Decrement,
  Neg,
} from "./ir";

import {
  ArrayType,
  BoolType,
  CharType,
  Datatype,
  IntType,
  InvalidType,
  LongArrayType,
  LongType,
  StringType,
  VoidType,
} from "./datatype";

import { Span } from "../span";
import { Scope } from "./scope";
import { lookup } from "dns";

export class IrChecker {
  private program: Program;
  private ok: boolean;
  private error_messages: string[] = [];

  private currentFunction: Method | null = null;
  private scope: Scope | null;
  private escapable: boolean = false;

  constructor(p: Program, filename: string) {
    this.program = p;
    this.ok = true;
    this.scope = p.scope;
  }

  public run(): Array<string> {
    this.checkProgram(this.program);
    return this.error_messages;
  }

  private emit(
    error_text: string,
    span: Span | undefined,
    identifier: string
  ): void {
    this.ok = false;
    if (span) {
      if (
        span.start.line === span.end.line &&
        span.start.col === span.end.col
      ) {
        this.error_messages.push(
          `Semantic error at line ${span.start.line}, column ${span.start.col}: ${error_text} (identifier: ${identifier})`
        );
      } else if (span.start.line === span.end.line) {
        this.error_messages.push(
          `Semantic error at line ${span.start.line}, column ${span.start.col}-${span.end.col}: ${error_text} (identifier: ${identifier})`
        );
      } else if (span.start.col === span.end.col) {
        this.error_messages.push(
          `Semantic error at line ${span.start.line}-${span.end.line}, column ${span.start.col}: ${error_text} (identifier: ${identifier})`
        );
      } else {
        this.error_messages.push(
          `Semantic error at line ${span.start.line}-${span.end.line}, column ${span.start.col}-${span.end.col}: ${error_text} (identifier: ${identifier})`
        );
      }
    } else {
      this.error_messages.push(
        `Semantic error: ${error_text} (identifier: ${identifier})`
      );
    }
  }

  private checkProgram(p: Program): void {
    // 1. No identifier is declared twice in the same scope. This include import identifiers, which
    // exist in the global scope.
    for (const i of p.imports) {
      this.checkImport(i);
    }

    // 3. The program contains a definition for a method called main that has type void and takes
    // no parameters. Note that since execution starts at method main , any methods defined after
    // main will never be executed.
    let containsMain = false;
    for (const m of p.methods) {
      this.escapable = false;
      this.checkMethod(m);
      if (m[1].method_name === "main") {
        containsMain = true;
      }
    }
    if (!containsMain) {
      this.emit("Program must contain a main method", p.span, "main");
    }
    // 2. No identifier is used before it is declared.

    // 6. String literals and array variables may not be used as parameters to non-import methods.
    // (Note: an expression like a[0] is not an array variable).

    // 9. An ⟨id⟩ used as a ⟨location⟩ must name a declared local/global variable or parameter.
    // 10. The ⟨id⟩ in a method statement must be a declared method or import.
    // 11. For all locations of the form ⟨id⟩[⟨expr⟩]:
    // (a) ⟨id⟩ must be an array variable, and
    // (b) the type of ⟨expr⟩ must be int .
    // 13. The ⟨expr⟩ in an if or while statement must have type bool , as well as the second ⟨expr⟩
    // of a for statement.
    // 14. The operands of the unary minus, ⟨arith op⟩s and ⟨rel op⟩s must have type int or long .
    // 15. The operands of ⟨eq op⟩s must have the same type, either int , long , or bool .
    // 16. The operands of ⟨cond op⟩s and the operand of logical not ( ! ) must have type bool .
    // 17. The ⟨location⟩ and the ⟨expr⟩ in an assignment, ⟨location⟩ = ⟨expr⟩, must have the same type.
    // 18. The ⟨location⟩ and the ⟨expr⟩ in a compound assignment, ⟨location⟩ += ⟨expr⟩, ⟨location⟩ -= ⟨expr⟩,
    // ⟨location⟩ *= ⟨expr⟩, ⟨location⟩ /= ⟨expr⟩, and ⟨location⟩ %= ⟨expr⟩, must be of type int or
    // long . The same is true of the ⟨location⟩ in ++ and -- statements.
    // 19. All break and continue statements must be contained within the body of a for or a
    // while statement.
    // 20. int() and long() casts only should take an int or long as an input
    // (a) int(expr) takes the expression and casts it to the int type. It is permissible for
    // ⟨expr⟩ to be of type int
    // (b) The same rules apply to the long(expr) and long type.
    // 21. All int literals must be in the range −2147483648 ≤ x ≤ 2147483647 (32 bits).
    // 22. All long literals must be in the range −9223372036854775808 ≤ x ≤ 9223372036854775807
    // (64 bits).
  }

  private checkImport(imp: [string, Import]): void {}

  private checkMethod(method: [string, Method]): void {
    // 3. The program contains a definition for a method called main that has type void and takes
    // no parameters. Note that since execution starts at method main , any methods defined after
    // main will never be executed.
    this.currentFunction = method[1];
    if (method[0] === "main") {
      if (!(method[1].returnType instanceof VoidType)) {
        this.emit(
          "Main method must have return type void",
          method[1].span,
          method[0]
        );
      }
      if (method[1].params.ordered_params.length !== 0) {
        this.emit(
          "Main method must have no parameters",
          method[1].span,
          method[0]
        );
      }
    }

    this.checkBlock(method[1].body);
    if (!(this.currentFunction.returnType instanceof VoidType)) {
      // if (!this.checkBlockStrictReturns(this.currentFunction.body)) {
      //   this.emit(
      //     "All paths must return",
      //     this.currentFunction.span,
      //     method[0]
      //   );
      // }
    }
  }

  private checkBlock(block: Block): void {
    this.scope = block.scope;
    block.statements.forEach((s) => {
      this.checkStatement(s);
    });
    this.scope = this.scope.parent;
  }

  private checkStatement(statement: Statement): void {
    if (statement instanceof Assignment) {
      this.checkAssignment(statement);
    } else if (statement instanceof MethodCallExpr) {
      this.checkMethodCallExpr(statement);
    } else if (statement instanceof IfElse) {
      this.checkIfElse(statement);
    } else if (statement instanceof ForLoop) {
      this.checkForLoop(statement);
    } else if (statement instanceof WhileLoop) {
      this.checkWhileLoop(statement);
    } else if (statement instanceof Return) {
      this.checkReturn(statement);
    } else if (statement instanceof Break) {
      this.checkBreak(statement);
    } else if (statement instanceof Continue) {
      this.checkContinue(statement);
    } else {
      this.emit("Unknown statement type", undefined, "unknown");
    }
  }

  private checkAssignment(assignment: Assignment): void {
    let lhs_type: Datatype = new InvalidType();
    let var_name: string = "";
    if (assignment.lhsIndexed) {
      const expr = assignment.lhsIndexed[1];
      this.checkExpr(expr);
      var_name = assignment.lhsIndexed[0];
      const arrType = this.scope?.lookup(var_name) as Datatype;
      if (!(arrType instanceof ArrayType)) {
        this.emit("Cannot index into non-array type", undefined, var_name);
        return;
      }
      lhs_type = this.inferType(arrType);
      if (!(this.inferType(expr) instanceof IntType)) {
        this.emit("Index must be an integer", undefined, var_name);
      }
    } else {
      var_name = assignment.lhsUnindexed as string;
      const field = this.scope?.lookup(var_name);
      if (!field) {
        this.emit("Variable not found", undefined, var_name);
      } else {
        if (field instanceof ArrayType) {
          this.emit("Cannot assign to array type", undefined, var_name);
        }
        lhs_type = this.inferType(field);
      }
    }

    this.checkExpr(assignment.rhs.expr);
    const rhs_type = assignment.rhs.expr as Datatype;

    // TODO make not terrible
    if (lhs_type instanceof LongType || lhs_type instanceof LongArrayType) {
      assignment.rhs.isLong = true;
    }

    if (
      assignment.rhs.operator instanceof Increment ||
      assignment.rhs.operator instanceof Decrement
    ) {
      if (!lhs_type.equals(new IntType()) && !lhs_type.equals(new LongType())) {
        this.emit(
          "Increment only allowed on int or long types",
          assignment.assignee_span,
          var_name
        );
      }
      return;
    }

    if (!(assignment.rhs.operator instanceof Assign)) {
      if (
        !(lhs_type.equals(new IntType()) || lhs_type.equals(new LongType()))
      ) {
        this.emit(
          "Compound assignment only allowed on int or long types",
          assignment.assignee_span,
          var_name
        );
      }
    }

    if (!this.inferType(assignment.rhs.expr).equals(lhs_type)) {
      this.emit(
        "Type mismatch in assignment, left type: " +
          lhs_type.constructor.name +
          " right type: " +
          this.inferType(rhs_type).constructor.name,
        assignment.assignee_span,
        var_name
      );
    }
  }

  private inferType(expr: Expr | undefined): Datatype {
    if (expr === undefined) return new InvalidType();
    if (
      expr instanceof IntType ||
      expr instanceof IntLiteral ||
      expr instanceof IntCastExpr ||
      // expr instanceof IntArrayType ||
      expr instanceof LenExpr ||
      expr.constructor?.name == "IntArrayType"
      // expr.name == "IntArrayType"
    ) {
      return new IntType();
    }
    if (
      expr instanceof LongType ||
      expr instanceof LongLiteral ||
      expr instanceof LongCastExpr ||
      expr.constructor?.name == "LongArrayType"
    ) {
      return new LongType();
    }
    if (
      expr instanceof BoolType ||
      expr instanceof BoolLiteral ||
      expr instanceof NotExpr ||
      expr.constructor?.name == "BoolArrayType"
    ) {
      return new BoolType();
    }
    if (expr instanceof StringType || expr instanceof StringLiteral) {
      return new StringType();
    }

    // Special cases
    if (expr instanceof BinExpr) {
      return this.inferBinExpr(expr);
    }

    if (expr instanceof NameExpr) {
      const datatype = this.scope?.lookup(expr.name);
      if (datatype) {
        return datatype;
      }
      return this.inferType(undefined);
    }

    if (expr instanceof ArrNameExpr) {
      const type = this.inferType(expr.expression);
      if (!(type instanceof IntLiteral || type.equals(new IntType()))) {
        this.emit("Index must be an integer", expr.span, expr.name);
      }
      return this.inferType(this.scope?.lookup(expr.name));
    }

    if (expr instanceof MethodCallExpr) {
      return this.getMethodReturnType((expr as MethodCallExpr).methodName);
    }

    if (expr instanceof NegativeExpr) {
      return this.inferType(expr.expr);
    }

    return new InvalidType();
  }

  private inferBinExpr(binExpr: BinExpr): Datatype {
    // const lhs_type = this.inferType(binExpr.expr1);
    // const rhs_type = this.inferType(binExpr.expr2);
    // if (
    //   lhs_type instanceof InvalidType ||
    //   rhs_type instanceof InvalidType ||
    //   !lhs_type.equals(rhs_type)
    // ) {
    //   this.emit("Type mismatch in binary expression", binExpr.span, "unknown");
    // }

    if (binExpr.binOp instanceof EqOp) {
      return new BoolType();
    }

    if (binExpr.binOp instanceof CondOp) {
      return new BoolType();
    }

    if (binExpr.binOp instanceof RelationOp) {
      return new BoolType();
    }

    if (binExpr.binOp instanceof ArithOp) {
      const leftType = this.inferType(binExpr.expr1);
      const rightType = this.inferType(binExpr.expr2);

      if (!leftType.equals(rightType)) {
        this.emit(
          "Type mismatch in binary expression",
          binExpr.span,
          "unknown"
        );
      }
      return this.inferType(binExpr.expr1);
      // TODO: fix this; need to check the less strict version of the int/long type
    }

    return new InvalidType();
  }

  private checkIfElse(ifElse: IfElse): void {
    // expr is already checked in the ir builder
    this.checkBlock(ifElse.trueBody);

    // 13. The ⟨expr⟩ in an if or while statement must have type bool , as well as the second ⟨expr⟩
    // of a for statement.
    this.checkExpr(ifElse.condition);
    if (!this.inferType(ifElse.condition).equals(new BoolType())) {
      this.emit("Type mismatch in if/else condition", ifElse.span, "unknown");
    }

    if (ifElse.falseBody) {
      this.checkBlock(ifElse.falseBody);
    }
  }

  private checkForLoop(forLoop: ForLoop): void {
    // 16. allows usage of continue and break for inner statements
    const previous_escape = this.escapable;
    this.escapable = true;
    // check init
    this.checkAssignment(forLoop.init);
    // check condition
    // 16. The operands of ⟨cond op⟩s and the operand of logical not ( ! ) must have type bool .
    this.checkExpr(forLoop.condition);
    if (!this.inferType(forLoop.condition).equals(new BoolType())) {
      this.emit("Type mismatch in for loop condition", forLoop.span, "unknown");
    }
    // check update
    this.checkAssignment(forLoop.update);
    // check body
    this.checkBlock(forLoop.body);
    this.escapable = previous_escape;
  }

  private checkWhileLoop(whileLoop: WhileLoop): void {
    // 16. allows usage of continue and break for inner statements
    const previous_escape = this.escapable;
    this.escapable = true;
    this.checkExpr(whileLoop.condition);
    // 13. The ⟨expr⟩ in an if or while statement must have type bool , as well as the second ⟨expr⟩
    // of a for statement.
    if (!(this.inferType(whileLoop.condition) instanceof BoolType)) {
      this.emit(
        "Type mismatch in while loop condition",
        whileLoop.span,
        "unknown"
      );
    }
    this.checkBlock(whileLoop.body);
    this.escapable = previous_escape;
  }

  private checkReturn(returnStmt: Return): void {
    const name = this.currentFunction?.method_name;
    // 7. A return statement must not have a return value unless it appears in the body of a method
    // that is declared to return a value.
    if (!this.currentFunction) {
      this.emit(
        "Return statement is not inside a function",
        returnStmt.span,
        "unknown"
      );
      return;
    }

    const lhs_type = this.currentFunction?.returnType as Datatype;
    if (lhs_type instanceof VoidType) {
      if (returnStmt.expr !== null) {
        this.emit(
          `Void method ${name} cannot return a value`,
          returnStmt.span,
          name ? name : "unknown"
        );
      }
    }

    if (returnStmt.expr === null) {
      if (!(lhs_type instanceof VoidType)) {
        this.emit(
          `Return type mismatch, expected void but got ${lhs_type}`,
          returnStmt.span,
          name ? name : "unknown"
        );
      }
      return;
    }

    const rhs_type = returnStmt.expr as Datatype;

    // 8. The expression in a return statement must have the same type as the declared result type
    // of the enclosing method definition.
    if (!this.inferType(rhs_type).equals(lhs_type)) {
      this.emit(
        `Return type mismatch, expected ${lhs_type.constructor.name} but got ${
          this.inferType(rhs_type).constructor.name
        }`,
        returnStmt.span,
        name ? name : "unknown"
      );
    }
  }

  private checkBreak(breakStmt: Break): void {
    // 19. All break and continue statements must be contained within the body of a for or a
    // while statement
    if (!this.escapable) {
      this.emit(
        "Break statement is not inside a loop",
        breakStmt.span,
        "unknown"
      );
    }
  }

  private checkContinue(continueStmt: Continue): void {
    // 19. All break and continue statements must be contained within the body of a for or a
    // while statement
    if (!this.escapable) {
      this.emit(
        "Continue statement is not inside a loop",
        continueStmt.span,
        "unknown"
      );
    }
  }

  private checkExpr(expr: Expr): void {
    if (expr instanceof BinExpr) {
      this.checkBinaryOperation(expr);
    } else if (expr instanceof NameExpr) {
      this.checkNameExpr(expr);
    } else if (expr instanceof ArrNameExpr) {
      this.checkArrNameExpr(expr);
    } else if (expr instanceof MethodCallExpr) {
      this.checkMethodCallExpr(expr);
      if (this.getMethodReturnType(expr.methodName).equals(new VoidType())) {
        this.emit(
          "Method call used in an expression must return a value",
          expr.span,
          expr.methodName
        );
      }
    } else if (expr instanceof CastExpr) {
      this.checkCastExpr(expr);
    } else if (expr instanceof LenExpr) {
      this.checkLenExpr(expr);
      // } else if (expr instanceof MinusExpr) {
      //   this.checkMinusExpr(expr);
    } else if (expr instanceof BinExpr) {
      this.checkBinExpr(expr);
    } else if (expr instanceof NotExpr) {
      this.checkNotExpr(expr);
    } else if (expr instanceof NegativeExpr) {
      this.checkUnaryOperation(expr);
    } else {
      // special case since we do some simplication in the ir builder
      if (!this.inferType(expr).equals(new InvalidType())) {
        return;
      }
      this.emit("Unknown expression type", undefined, "unknown");
    }
  }

  private checkBinaryOperation(binary_expr: BinExpr): void {
    this.checkExpr(binary_expr.expr1);
    this.checkExpr(binary_expr.expr2);

    const lhs_type = this.inferType(binary_expr.expr1);
    const rhs_type = this.inferType(binary_expr.expr2);

    if (!lhs_type.equals(rhs_type)) {
      this.emit(
        "Type mismatch in binary expression",
        binary_expr.span,
        "unknown"
      );
    }
    const type_isnt_numeric =
      !(lhs_type instanceof IntType) && !(lhs_type instanceof LongType);
    const type_is_bool = lhs_type instanceof BoolType;
    if (
      binary_expr.binOp instanceof ArithOp ||
      binary_expr.binOp instanceof RelationOp
    ) {
      if (type_isnt_numeric) {
        this.emit(
          "Type mismatch in binary expression",
          binary_expr.span,
          "unknown"
        );
      }
    }

    if (binary_expr.binOp instanceof EqOp) {
      if (type_isnt_numeric && !type_is_bool) {
        this.emit(
          "Type mismatch in equality check",
          binary_expr.span,
          "unknown"
        );
      }
    }
    if (binary_expr.binOp instanceof CondOp) {
      if (!type_is_bool) {
        this.emit(
          "Type mismatch in conditional check",
          binary_expr.span,
          "unknown"
        );
      }
    }
  }

  private checkNameExpr(nameExpr: NameExpr): void {
    // this is already evaluated in the ir builder
    // TODO check that the name is declared before use

    const type = this.scope?.lookup(nameExpr.name);
    if (!type) {
      this.emit("Variable not found", nameExpr.span, nameExpr.name);
    }
  }

  private checkArrNameExpr(arrNameExpr: ArrNameExpr): void {
    // this is already evaluated in the ir builder
    // TODO check that the name is declared before use

    const type = this.scope?.lookup(arrNameExpr.name);
    if (!type) {
      this.emit("Variable not found", arrNameExpr.span, arrNameExpr.name);
    }
  }

  private checkMethodCallExpr(methodCallExpr: MethodCallExpr): void {
    // check that the method is declared in the current scope
    const closestVar = this.scope?.lookup(methodCallExpr.methodName);
    const method = this.program.methods.get(methodCallExpr.methodName);

    if (closestVar && !(closestVar instanceof Method)) {
      this.emit(
        "Most direct declaration of method is shadowed by a variable",
        methodCallExpr.span,
        methodCallExpr.methodName
      );
    }
    const imports = this.program.imports.get(methodCallExpr.methodName);
    if (!method && !imports) {
      this.emit(
        "Method not found",
        methodCallExpr.span,
        methodCallExpr.methodName
      );
      return;
    }
    if (imports) {
      methodCallExpr.args
        .filter((arg) => !(arg instanceof StringLiteral))
        .forEach((arg) => {
          this.checkExpr(arg);
          const type = this.inferType(arg);
          if (type instanceof InvalidType || type instanceof VoidType) {
            this.emit(
              "Invalid type in method call",
              methodCallExpr.span,
              methodCallExpr.methodName
            );
          }
        });
      return;
    }

    // check that the method is declared before the call (rule 2)
    if (method && method.span.start.line > methodCallExpr.span.start.line) {
      this.emit(
        "Method called before declaration",
        methodCallExpr.span,
        methodCallExpr.methodName
      );
      return;
    }

    // 4. The number and types of parameters in a method call (non-import) must be the same as the
    // number and types of the declared parameters for the method.
    if (
      method &&
      method.params.ordered_params.length !== methodCallExpr.args.length
    ) {
      this.emit(
        "Method call has incorrect number of arguments",
        methodCallExpr.span,
        methodCallExpr.methodName
      );
      return;
    }

    // Check that the types of the arguments are correct
    for (let i = 0; i < methodCallExpr.args.length; i++) {
      const arg = methodCallExpr.args[i];
      const param = method?.params.ordered_params[i];
      if (!param) {
        this.emit(
          "Method call has too many arguments",
          methodCallExpr.span,
          methodCallExpr.methodName
        );
        return;
      }
      const argType = this.inferType(arg) as Datatype;
      const paramType = (param[1] as Field).type as Datatype;
      if (!argType.equals(paramType)) {
        this.emit(
          "Type mismatch in method call argument, expected " +
            paramType.constructor.name +
            " but got " +
            argType.constructor.name,
          methodCallExpr.span,
          methodCallExpr.methodName
        );
        return;
      }
    }
  }

  private checkCastExpr(castExpr: CastExpr): void {
    // 20. int() and long() casts only should take an int or long as an input
    // (a) int(expr) takes the expression and casts it to the int type. It is permissible for
    // ⟨expr⟩ to be of type int
    // (b) The same rules apply to the long(expr) and long type.
    if (
      castExpr.constructor.name == "IntCastExpr" ||
      castExpr.constructor.name == "LongCastExpr"
    ) {
      if (
        !(
          this.inferType(castExpr.expr).equals(new IntType()) ||
          this.inferType(castExpr.expr).equals(new LongType())
        )
      ) {
        this.emit("Type mismatch in cast expression", castExpr.span, "unknown");
      }
    }
  }

  private checkLenExpr(lenExpr: LenExpr): void {
    // 12. The argument of the len operator must be an array variable.
    const name = lenExpr.name;
    const type = this.scope?.lookup(name);
    if (type === null || !(type instanceof ArrayType)) {
      this.emit(
        "Argument of len operator must be an array variable",
        lenExpr.span,
        name
      );
    }
  }

  private checkBinExpr(binExpr: BinExpr): void {
    // check that the bin expression is valid
    if (binExpr.binOp instanceof EqOp) {
      if (
        !this.inferType(binExpr.expr1).equals(this.inferType(binExpr.expr2))
      ) {
        this.emit("Type mismatch in equality check", binExpr.span, "unknown");
      }
    } else if (
      binExpr.binOp instanceof ArithOp ||
      binExpr.binOp instanceof RelationOp
    ) {
      // rule 14: arith/rel operands must both be int or long
      if (
        !(
          this.inferType(binExpr.expr1).equals(new IntType()) &&
          this.inferType(binExpr.expr1).equals(new LongType()) &&
          this.inferType(binExpr.expr2).equals(new IntType()) &&
          this.inferType(binExpr.expr2).equals(new LongType())
        )
      ) {
        this.emit(
          "Type mismatch in binary expression",
          binExpr.span,
          "unknown"
        );
      }
    } else if (binExpr.binOp instanceof CondOp) {
      // 16. The operands of ⟨cond op⟩s and the operand of logical not ( ! ) must have type bool .
      if (
        !this.inferType(binExpr.expr1).equals(new BoolType()) ||
        !this.inferType(binExpr.expr2).equals(new BoolType())
      ) {
        this.emit(
          "Type mismatch in binary expression",
          binExpr.span,
          "unknown"
        );
      }
    }
  }

  private checkNotExpr(notExpr: NotExpr): void {
    // 16. The operands of ⟨cond op⟩s and the operand of logical not ( ! ) must have type bool .
    if (!this.inferType(notExpr.expr).equals(new BoolType())) {
      this.emit("Type mismatch in not expression", notExpr.span, "unknown");
    }
  }

  private checkUnaryOperation(unaryOperation: NegativeExpr): void {
    // 14. The operands of ⟨arith op⟩s and ⟨rel op⟩s must have type int or long .
    if (
      !(
        this.inferType(unaryOperation.expr).equals(new IntType()) ||
        this.inferType(unaryOperation.expr).equals(new LongType())
      )
    ) {
      this.emit(
        "Type mismatch in unary operation",
        unaryOperation.span,
        "unknown"
      );
    }
  }

  private getMethodReturnType(methodName: string): Datatype {
    const method = this.program.methods.get(methodName);
    const imports = this.program.imports.get(methodName);
    if (method) {
      return method.returnType as Datatype;
    }

    if (imports) {
      return new IntType();
    }

    return new InvalidType();
  }

  // checks if no matter which flow we take in the block body, the method will always return
  private checkBlockStrictReturns(block: Block): boolean {
    for (const statement of block.statements) {
      if (statement instanceof Return) {
        return true;
      }
      if (statement instanceof IfElse) {
        const trueBodyReturns = this.checkBlockStrictReturns(
          statement.trueBody
        );
        if (!trueBodyReturns) {
          continue;
        }
        if (statement.falseBody) {
          if (this.checkBlockStrictReturns(statement.falseBody)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
