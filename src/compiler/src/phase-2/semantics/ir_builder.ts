import {
  Program,
  Block,
  Method,
  Import,
  Expr,
  ArrNameExpr,
  NameExpr,
  LongCastExpr,
  IntCastExpr,
  LenExpr,
  BinaryOperation,
  PlusOp,
  MinusOp,
  MultiplyOp,
  DivideOp,
  ModuloOp,
  LessThanOp,
  GreaterThanOp,
  LessEqualOp,
  GreaterEqualOp,
  EqualOp,
  NotEqualOp,
  AndOp,
  OrOp,
  BinExpr,
  NotExpr,
  MethodCallExpr,
  StringLiteral,
  LongLiteral,
  IntLiteral,
  CharLiteral,
  BoolLiteral,
  Assignment,
  Increment,
  Decrement,
  AssignmentOperator,
  Assign,
  PlusAssign,
  MinusAssign,
  MultiplyAssign,
  DivideAssign,
  ModuloAssign,
  AssignContent,
  IfElse,
  ForLoop,
  WhileLoop,
  Return,
  Break,
  Continue,
  NegativeExpr,
  Field,
  EqOp,
} from "./ir";
import {
  BoolArrayType,
  BoolType,
  Datatype,
  IntArrayType,
  IntType,
  LongArrayType,
  LongType,
  VoidType,
} from "./datatype";
import { Params, Scope } from "./scope";
import {
  Field_declContext,
  Import_declContext,
  ProgramContext,
  Method_declContext,
  BlockContext,
  StatementContext,
  LocationContext,
  Assign_exprContext,
  ExprContext,
  Bin_opContext,
  Method_callContext,
  If_stmtContext,
  For_stmtContext,
  While_stmtContext,
  Return_stmtContext,
  TypeContext,
  Array_field_declContext,
  LiteralContext,
  Extern_argContext,
  Long_literalContext,
} from "../../phase-1/generated_antlr_ts/DecafParser";
import { ParserRuleContext, TerminalNode } from "antlr4";
import { Position, Span } from "../span";

export class IrBuilder {
  private antlr_tree: ProgramContext;
  private error_messages: string[] = [];
  private stringLiteralMap: Map<string, number>;

  constructor(antlr_tree: ProgramContext) {
    this.antlr_tree = antlr_tree;
    this.stringLiteralMap = new Map();
  }

  public buildErrorMessage(
    error_text: string,
    antlr_node: ParserRuleContext,
    identifier: string
  ): void {
    if (
      antlr_node.start.line === antlr_node.stop?.line &&
      antlr_node.start.column === antlr_node.stop?.column
    ) {
      this.error_messages.push(
        `Semantic error at line ${antlr_node.start.line}, column ${antlr_node.start.column}: ${error_text} (identifier: ${identifier})`
      );
    } else if (antlr_node.start.line === antlr_node.stop?.line) {
      this.error_messages.push(
        `Semantic error at line ${antlr_node.start.line}, column ${antlr_node.start.column}-${antlr_node.stop?.column}: ${error_text} (identifier: ${identifier})`
      );
    } else if (antlr_node.start.column === antlr_node.stop?.column) {
      this.error_messages.push(
        `Semantic error at line ${antlr_node.start.line}-${antlr_node.stop?.line}, column ${antlr_node.start.column}: ${error_text} (identifier: ${identifier})`
      );
    } else {
      this.error_messages.push(
        `Semantic error at line ${antlr_node.start.line}-${antlr_node.stop?.line}, column ${antlr_node.start.column}-${antlr_node.stop?.column}: ${error_text} (identifier: ${identifier})`
      );
    }
  }

  public getErrorMessages(): string[] {
    return this.error_messages;
  }

  public buildProgram(): Program {
    // build each function and make a map
    const program_span = this.spanConstructor(this.antlr_tree);
    const root_node = new Program(program_span);

    const antlr_tree = this.antlr_tree;
    const import_children = antlr_tree.import_decl_list();
    const field_children = antlr_tree.field_decl_list();
    const method_children = antlr_tree.method_decl_list();

    import_children.forEach((child) => {
      this.buildProgramImportDecl(child, root_node);
    });

    field_children.forEach((child) => {
      this.buildFieldDecl(child, root_node);
    });
    root_node.scope.symbols.forEach((field, name) => {
      root_node.natives.set(name, field.type);
    });

    method_children.forEach((child) => {
      this.buildProgramMethodDecl(child, root_node);
    });

    root_node.stringLiteralMap = this.stringLiteralMap;

    return root_node;
  }

  buildProgramImportDecl(
    antlr_node: Import_declContext,
    root_node: Program
  ): void {
    const method_name = antlr_node.ID().getText();
    const import_span = this.spanConstructor(antlr_node);
    const import_instance = new Import(method_name, import_span); // Check if import name conflicts with any method or global variable

    if (
      root_node.methods.has(method_name) ||
      root_node.scope.symbols.has(method_name)
    ) {
      this.buildErrorMessage(
        `Import name ${method_name} conflicts with existing identifier in global scope`,
        antlr_node,
        method_name
      );
      return;
    }

    const import_symbol_table = root_node.imports;
    if (import_symbol_table.has(antlr_node.ID().getText())) {
      this.buildErrorMessage(
        `Duplicate import declaration: ${antlr_node.ID().getText()}`,
        antlr_node,
        method_name
      );
      return;
    }
    import_symbol_table.set(method_name, import_instance);
  }

  buildFieldDecl(
    antlr_node: Field_declContext,
    root_node: Program | Block
  ): void {
    //todo add span info later probs is a good idea
    const root_scope_symbols = root_node.scope.symbols;

    if (root_node instanceof Program) {
      antlr_node.ID_list().forEach((val_field_decl_id) => {
        const field_name = val_field_decl_id.getText();
        if (
          root_node.imports.has(field_name) ||
          root_node.methods.has(field_name)
        ) {
          this.buildErrorMessage(
            `Field name ${field_name} conflicts with existing identifier in global scope`,
            antlr_node,
            field_name
          );
          return;
        }
      });

      antlr_node.array_field_decl_list().forEach((array_field_decl_id) => {
        const field_name = array_field_decl_id.ID().getText();
        if (
          root_node.imports.has(field_name) ||
          root_node.methods.has(field_name)
        ) {
          this.buildErrorMessage(
            `Array field name ${field_name} conflicts with existing identifier in global scope`,
            antlr_node,
            field_name
          );
          return;
        }
      });
    }

    antlr_node.ID_list().forEach((val_field_decl_id) => {
      const used_type = this.cast_datatype(antlr_node.type_());
      if (root_scope_symbols.has(val_field_decl_id.getText())) {
        this.buildErrorMessage(
          `Duplicate field declaration: ${val_field_decl_id.getText()}`,
          antlr_node,
          val_field_decl_id.getText()
        );
        return;
      }
      const field_name = val_field_decl_id.getText();
      const var_field = new Field(
        field_name,
        used_type,
        this.terminalSpanConstructor(val_field_decl_id)
      );
      root_scope_symbols.set(val_field_decl_id.getText(), var_field);
    });

    antlr_node.array_field_decl_list().forEach((array_field_decl) => {
      const array_size = this.extract_num_literal_value(array_field_decl, true);
      const used_type = this.cast_array_datatype(
        antlr_node.type_(),
        array_size
      );
      if (root_scope_symbols.has(array_field_decl.ID().getText())) {
        this.buildErrorMessage(
          `Duplicate field declaration: ${array_field_decl.ID().getText()}`,
          antlr_node,
          array_field_decl.ID().getText()
        );
        return;
      }
      const array_field_name = array_field_decl.ID().getText();
      const array_field = new Field(
        array_field_name,
        used_type,
        this.spanConstructor(array_field_decl),
        array_size
      );
      root_scope_symbols.set(array_field_decl.ID().getText(), array_field);
    });
  }

  buildProgramMethodDecl(
    antlr_node: Method_declContext,
    root_node: Program
  ): void {
    const method_name = antlr_node.ID(0).getText();
    const method_symbol_table = root_node.methods; // Check if method name conflicts with any import or global variable
    if (
      root_node.imports.has(method_name) ||
      root_node.scope.symbols.has(method_name)
    ) {
      this.buildErrorMessage(
        `Method name ${method_name} conflicts with existing identifier in global scope`,
        antlr_node,
        method_name
      );
      return;
    } //Check if method name already exists
    if (method_symbol_table.has(method_name)) {
      this.buildErrorMessage(
        `Duplicate method declaration: ${method_name}`,
        antlr_node,
        method_name
      );
      return;
    }

    const uncasted_types = antlr_node.type__list();
    const casted_types = uncasted_types.map((type) => this.cast_datatype(type));

    let method_return_type: Datatype;
    if (antlr_node.VOID()) {
      method_return_type = new VoidType();
    } else {
      method_return_type = casted_types.shift() as Datatype;
      uncasted_types.shift();
    }
    const method_param_names = antlr_node.ID_list().slice(1);
    const method_params_list: [string, Datatype, Span][] = casted_types.map(
      (param_type, index) => {
        const param_name = method_param_names[index].getText();
        const param_type_node = uncasted_types[index];
        const param_span = this.param_span_constructor(
          param_type_node,
          method_param_names[index]
        );
        return [param_name, param_type, param_span];
      }
    );

    for (let i = 0; i < method_params_list.length; i++) {
      for (let j = 0; j < i; j++) {
        if (method_params_list[i][0] === method_params_list[j][0]) {
          this.buildErrorMessage(
            `Duplicate param name in method declaration: ${method_name}`,
            antlr_node,
            method_params_list[i][0]
          );
        }
      }
    }
    const ast_method = new Method(
      method_name,
      new Params(method_params_list, new Scope(root_node.scope)),
      method_return_type,
      this.spanConstructor(antlr_node)
    );
    this.buildMethodBlock(antlr_node.block(), ast_method);
    method_symbol_table.set(method_name, ast_method);
  }

  buildMethodBlock(antlr_node: BlockContext, root_node: Method) {
    const block_span = this.spanConstructor(antlr_node);
    const method_block = new Block(new Scope(root_node.params), [], block_span);

    root_node.params.ordered_params.forEach(([param_name, _]) => {
      if (method_block.scope.symbols.has(param_name)) {
        this.buildErrorMessage(
          `Variable ${param_name} conflicts with method parameter name`,
          antlr_node,
          param_name
        );
      }
    });

    root_node.body = method_block;
    this.fillInBlockInfo(antlr_node, method_block);
    method_block.scope.symbols.forEach((value, param_name) => {
      const method_params = root_node.params;
      if (method_params.symbols.has(param_name)) {
        this.buildErrorMessage(
          `Variable ${param_name} conflicts with method parameter name`,
          antlr_node,
          param_name
        );
      }
      if (root_node.method_name === param_name) {
        this.buildErrorMessage(
          `Variable ${param_name} conflicts with method name`,
          antlr_node,
          param_name
        );
      }
    });
  }

  fillInBlockInfo(antlr_node: BlockContext, method_block: Block) {
    const field_declarations = antlr_node.field_decl_list();
    field_declarations.forEach((field_decl) => {
      this.buildFieldDecl(field_decl, method_block);
    });

    const statements = antlr_node.statement_list();
    statements.forEach((statement) => {
      this.buildBlockStatement(statement, method_block);
    });
  }

  buildBlockStatement(antlr_node: StatementContext, root_node: Block) {
    if (antlr_node.location()) {
      this.buildStatementLocAssign(antlr_node, root_node);
      return;
    }
    if (antlr_node.method_call()) {
      root_node.statements.push(
        this.build_method_call(antlr_node.method_call())
      );
      return;
    }

    if (antlr_node.if_stmt()) {
      this.buildStatementIf(antlr_node.if_stmt(), root_node);
      return;
    }
    if (antlr_node.for_stmt()) {
      this.buildStatementFor(antlr_node.for_stmt(), root_node);
      return;
    }
    if (antlr_node.while_stmt()) {
      this.buildStatementWhile(antlr_node.while_stmt(), root_node);
      return;
    }
    if (antlr_node.return_stmt()) {
      this.buildStatementReturn(antlr_node.return_stmt(), root_node);
      return;
    }
    if (antlr_node.BREAK()) {
      this.buildStatementBreak(antlr_node, root_node);
      return;
    } // antlr continue
    if (antlr_node.CONTINUE()) {
      this.buildStatementContinue(antlr_node, root_node);
      return;
    }
    throw new Error();
  }

  buildStatementLocAssign(
    antlr_node: StatementContext,

    root_node: Block
  ) {
    const assign_node = this.createStatementLocAssign(
      antlr_node.location(),
      antlr_node.assign_expr()
    );

    root_node.statements.push(assign_node);
  }

  build_method_call(antlr_node: Method_callContext): MethodCallExpr {
    const method_name = antlr_node.method_name().getText();
    const method_params = antlr_node.expr_list();
    const params = method_params.map((expr) => this.evaluate_expr(expr));
    if (params.length === 0) {
      antlr_node.extern_arg_list().forEach((arg) => {
        const evaluated_extern_arg = this.evaluate_extern_arg(arg, method_name);
        params.push(evaluated_extern_arg);
      });
    }
    return new MethodCallExpr(
      method_name,
      params,
      this.spanConstructor(antlr_node)
    );
  }

  buildStatementIf(antlr_node: If_stmtContext, root_node: Block) {
    const antlr_if_block = antlr_node.block(0);
    const antlr_else_block = antlr_node.block(1);

    const if_block = new Block(
      new Scope(root_node.scope),
      [],
      this.spanConstructor(antlr_if_block)
    );
    this.fillInBlockInfo(antlr_if_block, if_block);

    let else_block: Block | null = null;
    if (antlr_else_block) {
      else_block = new Block(
        new Scope(root_node.scope),
        [],
        this.spanConstructor(antlr_else_block)
      );
      this.fillInBlockInfo(antlr_else_block, else_block);
    }
    const if_else_statement = new IfElse(
      this.evaluate_expr(antlr_node.expr()),
      if_block,
      else_block,
      this.spanConstructor(antlr_node)
    );
    root_node.statements.push(if_else_statement);
  }

  buildStatementFor(antlr_node: For_stmtContext, root_node: Block) {
    const iteration_variable = antlr_node.ID().getText();
    const initializing_expr = this.evaluate_expr(antlr_node.expr(0));
    const for_condition = this.evaluate_expr(antlr_node.expr(1));
    const update_node = antlr_node.for_update();
    const body = antlr_node.block();

    const for_assignment = new Assignment(
      new AssignContent(new Assign(), initializing_expr),
      this.terminalSpanConstructor(antlr_node.ID()),
      this.spanConstructor(antlr_node)
    );
    for_assignment.lhsUnindexed = iteration_variable;

    const ir_body_block = new Block(
      new Scope(root_node.scope),
      [],
      this.spanConstructor(body)
    );
    this.fillInBlockInfo(body, ir_body_block);

    const update_assignment = this.createStatementLocAssign(
      update_node.location(),
      update_node.assign_expr()
    );

    const for_loop = new ForLoop(
      for_assignment,
      for_condition,
      update_assignment,
      ir_body_block,
      this.spanConstructor(antlr_node)
    );
    root_node.statements.push(for_loop);
  }

  buildStatementWhile(antlr_node: While_stmtContext, root_node: Block) {
    const while_condition = this.evaluate_expr(antlr_node.expr());
    const body = antlr_node.block();

    const ir_body_block = new Block(
      new Scope(root_node.scope),
      [],
      this.spanConstructor(body)
    );
    this.fillInBlockInfo(body, ir_body_block);

    const while_loop = new WhileLoop(
      while_condition,
      ir_body_block,
      this.spanConstructor(antlr_node)
    );
    root_node.statements.push(while_loop);
  }

  buildStatementReturn(antlr_node: Return_stmtContext, root_node: Block) {
    if (antlr_node.expr()) {
      root_node.statements.push(
        new Return(
          this.evaluate_expr(antlr_node.expr()),
          this.spanConstructor(antlr_node)
        )
      );
      return;
    }
    root_node.statements.push(
      new Return(null, this.spanConstructor(antlr_node))
    );
  }

  buildStatementBreak(antlr_node: StatementContext, root_node: Block) {
    root_node.statements.push(new Break(this.spanConstructor(antlr_node)));
  }

  buildStatementContinue(antlr_node: StatementContext, root_node: Block) {
    root_node.statements.push(new Continue(this.spanConstructor(antlr_node)));
  }

  createStatementLocAssign(
    lhs_antlr_node: LocationContext,
    antlr_assign_expr: Assign_exprContext
  ): Assignment {
    // const assign_node = new Assignment();

    let assign_node: Assignment;
    const assignee_span = this.spanConstructor(lhs_antlr_node);
    const assign_expr_span = this.spanConstructor(antlr_assign_expr); //rhs

    if (antlr_assign_expr.increment()) {
      if (antlr_assign_expr.increment().INCREMENT()) {
        assign_node = new Assignment(
          new AssignContent(new Increment(), new Expr()),
          assignee_span,
          assign_expr_span
        );
      } else {
        assign_node = new Assignment(
          new AssignContent(new Decrement(), new Expr()),
          assignee_span,
          assign_expr_span
        );
      }
    } else {
      const ir_assign_expr = new AssignContent(
        this.cast_operator(antlr_assign_expr),
        this.evaluate_expr(antlr_assign_expr.expr())
      );
      assign_node = new Assignment(
        ir_assign_expr,
        assignee_span,
        assign_expr_span
      );
    } //lhs

    if (lhs_antlr_node.expr()) {
      const var_name = lhs_antlr_node.ID().getText();
      assign_node.lhsIndexed = [
        var_name,
        this.evaluate_expr(lhs_antlr_node.expr()),
      ];
    } else {
      const var_name = lhs_antlr_node.ID().getText();
      assign_node.lhsUnindexed = var_name;
    }

    return assign_node;
  } /** Expressions */

  evaluate_expr(antlr_node: ExprContext, is_positive?: boolean): Expr {
    const expression_span = this.spanConstructor(antlr_node);
    if (antlr_node.MINUS() && antlr_node.expr_list().length == 1) {
      const edge_case_unary = this.evaluateUnaryEdgeCase(
        antlr_node,
        expression_span
      );
      if (edge_case_unary) return edge_case_unary;
      return new NegativeExpr(
        this.evaluate_expr(antlr_node.expr(0), false),
        expression_span
      );
    }
    if (antlr_node.NOT()) {
      return new NotExpr(
        this.evaluate_expr(antlr_node.expr(0)),
        expression_span
      );
    }
    if (antlr_node.INT()) {
      return new IntCastExpr(
        this.evaluate_expr(antlr_node.expr(0)),
        expression_span
      );
    }
    if (antlr_node.LONG()) {
      return new LongCastExpr(
        this.evaluate_expr(antlr_node.expr(0)),
        expression_span
      );
    }
    if (antlr_node.LEN()) {
      return new LenExpr(antlr_node.ID().getText(), expression_span);
    }
    const binary_operator = this.binOpHandler(antlr_node);
    if (binary_operator) {
      return new BinExpr(
        this.evaluate_expr(antlr_node.expr(0)),
        binary_operator,
        this.evaluate_expr(antlr_node.expr(1)),
        expression_span
      );
    }
    if (antlr_node.NOT()) {
      return new NotExpr(
        this.evaluate_expr(antlr_node.expr(0)),
        expression_span
      );
    }
    if (antlr_node.location()) {
      const var_name = antlr_node.location().ID().getText();
      if (antlr_node.location().LEFT_BRACKET()) {
        return new ArrNameExpr(
          var_name,
          this.evaluate_expr(antlr_node.location().expr()),
          expression_span
        );
      }
      return new NameExpr(var_name, expression_span);
    }
    if (antlr_node.method_call()) {
      return this.build_method_call(antlr_node.method_call());
    }
    if (antlr_node.literal()) {
      const literal_node = antlr_node.literal();
      const is_positive = literal_node.MINUS() === null;
      if (literal_node.int_literal()) {
        const int_value = this.extract_num_literal_value(
          literal_node,
          is_positive
        );

        return new IntLiteral(int_value, expression_span);
      }
      if (literal_node.long_literal()) {
        const long_value = this.extract_long_literal_value(
          literal_node,
          is_positive
        );
        return new LongLiteral(long_value, expression_span);
      }
      if (antlr_node.literal().CHARLITERAL()) {
        // turns char into an int since thats the interpretation in our grammar /shrug
        return new IntLiteral(
          antlr_node
            .literal()
            .CHARLITERAL()
            .getText()
            .slice(1, -1)
            .charCodeAt(0),
          expression_span
        );
      }
      if (antlr_node.literal().BOOLLITERAL().getText() == "true") {
        return new BoolLiteral(true, expression_span);
      }
      if (antlr_node.literal().BOOLLITERAL().getText() == "false") {
        return new BoolLiteral(false, expression_span);
      }
      throw new Error();
    }

    return this.evaluate_expr(antlr_node.expr(0));
  }

  cast_operator(antlr_node: Assign_exprContext): AssignmentOperator {
    if (antlr_node.increment()) {
      if (antlr_node.increment().INCREMENT()) {
        return new Increment();
      } else {
        return new Decrement();
      }
    }
    if (antlr_node.assign_op().PLUS()) {
      return new PlusAssign();
    }
    if (antlr_node.assign_op().MINUS()) {
      return new MinusAssign();
    }
    if (antlr_node.assign_op().MULTIPLY()) {
      return new MultiplyAssign();
    }
    if (antlr_node.assign_op().DIVIDE()) {
      return new DivideAssign();
    }
    if (antlr_node.assign_op().MODULO()) {
      return new ModuloAssign();
    }
    if (antlr_node.assign_op().ASSIGN()) {
      return new Assign();
    }
    throw new Error();
  }

  evaluateUnaryEdgeCase(antlr_node: ExprContext, span: Span): Expr | null {
    if (antlr_node.expr(0).getText() == "2147483648") {
      return new IntLiteral(-2147483648, span);
    }
    if (antlr_node.expr(0).getText() == "9223372036854775808L") {
      return new LongLiteral(-9223372036854775808n, span);
    }
    return null;
  }

  binOpHandler(antrl_node: ExprContext): BinaryOperation | null {
    if (antrl_node.PLUS()) {
      return new PlusOp();
    }
    if (antrl_node.MINUS()) {
      return new MinusOp();
    }
    if (antrl_node.MULTIPLY()) {
      return new MultiplyOp();
    }
    if (antrl_node.DIVIDE()) {
      return new DivideOp();
    }
    if (antrl_node.MODULO()) {
      return new ModuloOp();
    }

    if (antrl_node.LESS_THAN()) {
      return new LessThanOp();
    }
    if (antrl_node.GREATER_THAN()) {
      return new GreaterThanOp();
    }
    if (antrl_node.LESS_EQUAL()) {
      return new LessEqualOp();
    }
    if (antrl_node.GREATER_EQUAL()) {
      return new GreaterEqualOp();
    }
    if (antrl_node.EQUAL()) {
      return new EqualOp();
    }
    if (antrl_node.NOT_EQUAL()) {
      return new NotEqualOp();
    }

    if (antrl_node.AND()) {
      return new AndOp();
    }
    if (antrl_node.OR()) {
      return new OrOp();
    }
    return null;
  }

  spanConstructor(antlr_node: ParserRuleContext): Span {
    const start_pos = new Position(
      antlr_node.start.line,
      antlr_node.start.column
    );
    const stop_column =
      (antlr_node.stop?.column as number) +
      (antlr_node.stop?.text.length as number) -
      1;
    const end_pos = new Position(antlr_node.stop?.line as number, stop_column);
    return new Span(start_pos, end_pos);
  }

  terminalSpanConstructor(antlr_node: TerminalNode): Span {
    const start_pos = new Position(
      antlr_node.symbol.line,
      antlr_node.symbol.column
    ); //todo fix end line in cases of \n and other multi line characters
    const end_pos = new Position(
      antlr_node.symbol.line,
      antlr_node.symbol.column + antlr_node.getText().length - 1
    );
    return new Span(start_pos, end_pos);
  }

  param_span_constructor(
    type_node: TypeContext,
    name_node: TerminalNode
  ): Span {
    const start_pos = new Position(
      type_node.start.line,
      type_node.start.column
    );
    const end_pos = new Position(
      name_node.symbol.line,
      name_node.symbol.column + name_node.getText().length - 1
    );
    return new Span(start_pos, end_pos);
  }

  cast_datatype(antlr_node: TypeContext): Datatype {
    if (antlr_node.BOOL()) {
      return new BoolType();
    }
    if (antlr_node.INT()) {
      return new IntType();
    }
    if (antlr_node.LONG()) {
      return new LongType();
    }
    throw new Error();
  }

  cast_array_datatype(antlr_node: TypeContext, array_size: number): Datatype {
    if (array_size < 1) {
      this.buildErrorMessage(
        `Array size must be greater than 0`,
        antlr_node,
        "unknown"
      );
    }
    if (antlr_node.BOOL()) {
      return new BoolArrayType(array_size);
    }
    if (antlr_node.INT()) {
      return new IntArrayType(array_size);
    }
    if (antlr_node.LONG()) {
      return new LongArrayType(array_size);
    }
    throw new Error();
  }

  extract_num_literal_value(
    antlr_node: Array_field_declContext | LiteralContext,
    is_positive: boolean
  ): number {
    let value: bigint;
    if (antlr_node.int_literal().DECIMALLITERAL()) {
      value = BigInt(antlr_node.int_literal().DECIMALLITERAL().getText());
    } else {
      value = BigInt(antlr_node.int_literal().HEXLITERAL().getText());
    }
    if (!is_positive) {
      value = -value;
    }
    if (value < BigInt(-2147483648n) || value > BigInt(2147483647n)) {
      this.buildErrorMessage(
        `Integer literal out of range: ${value}`,
        antlr_node,
        value.toString()
      );
    }
    return Number(value);
  }
  extract_long_literal_value(
    antlr_node: LiteralContext,
    is_positive: boolean
  ): bigint {
    let long_value: bigint;
    if (antlr_node.long_literal().LONGDECLITERAL()) {
      long_value = BigInt(
        antlr_node.long_literal().LONGDECLITERAL().getText().replace("L", "")
      );
    } else {
      long_value = BigInt(
        antlr_node.long_literal().LONGHEXLITERAL().getText().replace("L", "")
      );
    }
    if (!is_positive) {
      long_value = BigInt(-1) * long_value;
    }
    if (
      long_value < BigInt(-9223372036854775808n) ||
      long_value > BigInt(9223372036854775807n)
    ) {
      this.buildErrorMessage(
        `Long literal out of range: ${long_value}`,
        antlr_node,
        long_value.toString()
      );
    }
    return long_value;
  }
  private add_string_literal(stringLiteral: string) {
    if (!this.stringLiteralMap.has(stringLiteral)) {
      this.stringLiteralMap.set(stringLiteral, 1);
      return;
    }

    this.stringLiteralMap.set(
      stringLiteral,
      (this.stringLiteralMap.get(stringLiteral) as number) + 1
    );
  }
  evaluate_extern_arg(
    antlr_node: Extern_argContext,
    method_name: string
  ): Expr {
    if (antlr_node.STRINGLITERAL()) {
      //removes " characters
      const stringLiteral = antlr_node.STRINGLITERAL().getText().slice(1, -1);
      this.add_string_literal(stringLiteral);
      return new StringLiteral(stringLiteral, this.spanConstructor(antlr_node));
    }
    return this.evaluate_expr(antlr_node.expr());
  }
}
