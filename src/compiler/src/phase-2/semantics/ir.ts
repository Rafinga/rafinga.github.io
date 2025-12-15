import { Params, Scope } from "./scope";
import { Position, Span } from "../span";
// import { assert } from "console";
import { Datatype } from "./datatype";

export abstract class IrNode {}

export class Program extends IrNode {
  imports: Map<string, Import> = new Map();
  methods: Map<string, Method> = new Map();
  natives: Map<string, Datatype> = new Map();
  public stringLiteralMap: Map<string, number>;
  scope: Scope = new Scope(null);

  constructor(public span: Span) {
    super();
    this.stringLiteralMap = new Map();
  }
}
export class Field extends IrNode {
  array_size: number | undefined;

  constructor(
    public name: string,
    public type: Datatype,
    public span: Span,
    array_size?: number
  ) {
    super();
    this.array_size = array_size;
  }

  equals(other: Field): boolean {
    return this.name === other.name && this.type === other.type;
  }
}

export class Method extends IrNode {
  body: Block = new Block(
    new Scope(null),
    [],
    new Span(new Position(0, 0), new Position(0, 0))
  );
  constructor(
    public method_name: string,
    public params: Params,
    public returnType: Datatype,
    public span: Span
  ) {
    super();
  }
  get_return_type(scope: Scope): Datatype {
    return this.returnType;
  }
}

export class Import extends IrNode {
  constructor(public name: string, public span: Span) {
    super();
  }
}

export class Block extends IrNode {
  constructor(
    public scope: Scope,
    public statements: Statement[],
    public span: Span
  ) {
    super();
  }
}

/** Expressions */

export class Expr extends IrNode {}

export class NameExpr extends Expr {
  constructor(public name: string, public span: Span) {
    super();
  }
}
export class ArrNameExpr extends Expr {
  constructor(public name: string, public expression: Expr, public span: Span) {
    super();
  }
}

export class CastExpr extends Expr {
  constructor(public expr: Expr, public span: Span) {
    super();
  }
}

export class LongCastExpr extends CastExpr {
  constructor(expr: Expr, public span: Span) {
    super(expr, span);
  }
}

export class IntCastExpr extends CastExpr {
  constructor(expr: Expr, public span: Span) {
    super(expr, span);
  }
}
export class LenExpr extends Expr {
  constructor(public name: string, public span: Span) {
    super();
  }
}

export class BinExpr extends Expr {
  constructor(
    public expr1: Expr,
    public binOp: BinaryOperation,
    public expr2: Expr,
    public span: Span
  ) {
    super();
  }
}

export class NotExpr extends Expr {
  constructor(public expr: Expr, public span: Span) {
    super();
  }
}

export class NegativeExpr extends Expr {
  constructor(public expr: Expr, public span: Span) {
    super();
  }
}

/** Statements */

export abstract class Statement extends IrNode {}
//in grammar appears as assign expression
export class AssignContent extends IrNode {
  public isLong: boolean = false;

  constructor(public operator: AssignmentOperator, public expr: Expr) {
    super();
  }
}
export class Assignment extends Statement {
  lhsIndexed: [string, Expr] | null = null;
  lhsUnindexed: string | null = null;
  constructor(
    public rhs: AssignContent,
    public assignee_span: Span,
    public assign_expr_span: Span
  ) {
    super();
  }
}
export class MethodCallExpr extends Statement {
  constructor(
    public methodName: string,
    public args: (MethodCallExpr | Expr | StringLiteral)[],
    public span: Span
  ) {
    super();
  }

  // get_return_type(scope: Scope): Datatype {

  // }
}

export class IfElse extends Statement {
  constructor(
    public condition: Expr,
    public trueBody: Block,
    public falseBody: Block | null,
    public span: Span
  ) {
    super();
  }
}

export class ForLoop extends Statement {
  constructor(
    public init: Assignment,
    public condition: Expr,
    public update: Assignment,
    public body: Block,
    public span: Span
  ) {
    super();
  }
}

export class WhileLoop extends Statement {
  constructor(public condition: Expr, public body: Block, public span: Span) {
    super();
  }
}

export class Return extends Statement {
  constructor(public expr: Expr | null, public span: Span) {
    super();
  }
}

export class Break extends Statement {
  constructor(public span: Span) {
    super();
  }
}

export class Continue extends Statement {
  constructor(public span: Span) {
    super();
  }
}

/* Tokens */

/** Unary Operators */

export abstract class UnaryOp extends IrNode {}
export class Neg extends UnaryOp {}
export class Not extends UnaryOp {}

// ------ LITERALS ------

abstract class Literal extends IrNode {
  literalType: LiteralType;
  constructor(d: LiteralType) {
    super();
    this.literalType = d;
  }
}

enum LiteralType {
  Int = "int",
  Long = "long",
  Bool = "bool",
  Char = "char",
  String = "string",
}

export class IntLiteral extends Literal {
  constructor(public val: number, public span: Span) {
    super(LiteralType.Int);
    // assert(Number.isInteger(val), "int type must be integer");
  }

  public toString(): string {
    return `${this.val}`;
  }
}

export class LongLiteral extends Literal {
  constructor(public val: bigint, public span: Span) {
    super(LiteralType.Long);
    //todo verify if this is necessary
    // assert(val instanceof BigInt, "long type must be integer");
  }
  public toString(): string {
    return `${this.val}L`;
  }
}
export class CharLiteral extends Literal {
  constructor(public val: string, public span: Span) {
    super(LiteralType.Char);
  }
}

export class StringLiteral extends Literal {
  constructor(public val: string, public span: Span) {
    super(LiteralType.String);
  }

  public toString() {
    return `"${this.val}"`;
  }
}

export class BoolLiteral extends Literal {
  constructor(public b: boolean, public span: Span) {
    super(LiteralType.Bool);
  }
}

// ----- OPERATORS -----

export abstract class AssignmentOperator extends IrNode {}

export class Assign extends AssignmentOperator {}
export class PlusAssign extends AssignmentOperator {}
export class MinusAssign extends AssignmentOperator {}
export class MultiplyAssign extends AssignmentOperator {}
export class DivideAssign extends AssignmentOperator {}
export class ModuloAssign extends AssignmentOperator {}

export abstract class IncrementOperator extends AssignmentOperator {}

export class Increment extends IncrementOperator {}
export class Decrement extends IncrementOperator {}

// ----- BINARY OPERATORS -----

export class BinaryOperation extends Expr {
  constructor() {
    super();
  }
}
/** Arithmetic Operators */
export class ArithOp extends BinaryOperation {
  constructor() {
    super();
  }
}

export class PlusOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "+";
  }
}

export class MinusOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "-";
  }
}

export class MultiplyOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "*";
  }
}
export class DivideOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "/";
  }
}

export class ModuloOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "%";
  }
}

export class LeftShiftOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "<<";
  }
}

export class RightShiftOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return ">>";
  }
}

export class BitAndOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "&";
  }
}

export class BitOrOp extends ArithOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "|";
  }
}
/** Relational Operators */
export class RelationOp extends BinaryOperation {
  constructor() {
    super();
  }
}

export class LessThanOp extends RelationOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "<";
  }
}

export class GreaterThanOp extends RelationOp {
  constructor() {
    super();
  }

  public toString(): string {
    return ">";
  }
}

export class LessEqualOp extends RelationOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "<=";
  }
}
export class GreaterEqualOp extends RelationOp {
  constructor() {
    super();
  }

  public toString(): string {
    return ">=";
  }
}

export class EqOp extends BinaryOperation {
  constructor() {
    super();
  }
}

export class EqualOp extends EqOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "==";
  }
}

export class NotEqualOp extends EqOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "!=";
  }
}
/** Conditional Operators */
export class CondOp extends BinaryOperation {
  constructor() {
    super();
  }
}

export class AndOp extends CondOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "&&";
  }
}
export class OrOp extends CondOp {
  constructor() {
    super();
  }

  public toString(): string {
    return "||";
  }
}
