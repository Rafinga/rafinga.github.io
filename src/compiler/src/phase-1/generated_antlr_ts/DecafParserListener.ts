// Generated from DecafParser.g4 by ANTLR 4.13.2

import {ParseTreeListener} from "antlr4";


import { ProgramContext } from "./DecafParser.js";
import { Import_declContext } from "./DecafParser.js";
import { Field_declContext } from "./DecafParser.js";
import { Array_field_declContext } from "./DecafParser.js";
import { Method_declContext } from "./DecafParser.js";
import { BlockContext } from "./DecafParser.js";
import { TypeContext } from "./DecafParser.js";
import { StatementContext } from "./DecafParser.js";
import { If_stmtContext } from "./DecafParser.js";
import { For_stmtContext } from "./DecafParser.js";
import { While_stmtContext } from "./DecafParser.js";
import { Return_stmtContext } from "./DecafParser.js";
import { For_updateContext } from "./DecafParser.js";
import { Assign_exprContext } from "./DecafParser.js";
import { Assign_opContext } from "./DecafParser.js";
import { IncrementContext } from "./DecafParser.js";
import { DecrementContext } from "./DecafParser.js";
import { Method_callContext } from "./DecafParser.js";
import { Method_nameContext } from "./DecafParser.js";
import { LocationContext } from "./DecafParser.js";
import { ExprContext } from "./DecafParser.js";
import { Extern_argContext } from "./DecafParser.js";
import { Bin_opContext } from "./DecafParser.js";
import { Arith_opContext } from "./DecafParser.js";
import { Rel_opContext } from "./DecafParser.js";
import { Eq_opContext } from "./DecafParser.js";
import { Cond_opContext } from "./DecafParser.js";
import { LiteralContext } from "./DecafParser.js";
import { Int_literalContext } from "./DecafParser.js";
import { Long_literalContext } from "./DecafParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `DecafParser`.
 */
export default class DecafParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `DecafParser.program`.
	 * @param ctx the parse tree
	 */
	enterProgram?: (ctx: ProgramContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.program`.
	 * @param ctx the parse tree
	 */
	exitProgram?: (ctx: ProgramContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.import_decl`.
	 * @param ctx the parse tree
	 */
	enterImport_decl?: (ctx: Import_declContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.import_decl`.
	 * @param ctx the parse tree
	 */
	exitImport_decl?: (ctx: Import_declContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.field_decl`.
	 * @param ctx the parse tree
	 */
	enterField_decl?: (ctx: Field_declContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.field_decl`.
	 * @param ctx the parse tree
	 */
	exitField_decl?: (ctx: Field_declContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.array_field_decl`.
	 * @param ctx the parse tree
	 */
	enterArray_field_decl?: (ctx: Array_field_declContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.array_field_decl`.
	 * @param ctx the parse tree
	 */
	exitArray_field_decl?: (ctx: Array_field_declContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.method_decl`.
	 * @param ctx the parse tree
	 */
	enterMethod_decl?: (ctx: Method_declContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.method_decl`.
	 * @param ctx the parse tree
	 */
	exitMethod_decl?: (ctx: Method_declContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.type`.
	 * @param ctx the parse tree
	 */
	enterType?: (ctx: TypeContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.type`.
	 * @param ctx the parse tree
	 */
	exitType?: (ctx: TypeContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.if_stmt`.
	 * @param ctx the parse tree
	 */
	enterIf_stmt?: (ctx: If_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.if_stmt`.
	 * @param ctx the parse tree
	 */
	exitIf_stmt?: (ctx: If_stmtContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.for_stmt`.
	 * @param ctx the parse tree
	 */
	enterFor_stmt?: (ctx: For_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.for_stmt`.
	 * @param ctx the parse tree
	 */
	exitFor_stmt?: (ctx: For_stmtContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.while_stmt`.
	 * @param ctx the parse tree
	 */
	enterWhile_stmt?: (ctx: While_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.while_stmt`.
	 * @param ctx the parse tree
	 */
	exitWhile_stmt?: (ctx: While_stmtContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.return_stmt`.
	 * @param ctx the parse tree
	 */
	enterReturn_stmt?: (ctx: Return_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.return_stmt`.
	 * @param ctx the parse tree
	 */
	exitReturn_stmt?: (ctx: Return_stmtContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.for_update`.
	 * @param ctx the parse tree
	 */
	enterFor_update?: (ctx: For_updateContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.for_update`.
	 * @param ctx the parse tree
	 */
	exitFor_update?: (ctx: For_updateContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.assign_expr`.
	 * @param ctx the parse tree
	 */
	enterAssign_expr?: (ctx: Assign_exprContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.assign_expr`.
	 * @param ctx the parse tree
	 */
	exitAssign_expr?: (ctx: Assign_exprContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.assign_op`.
	 * @param ctx the parse tree
	 */
	enterAssign_op?: (ctx: Assign_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.assign_op`.
	 * @param ctx the parse tree
	 */
	exitAssign_op?: (ctx: Assign_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.increment`.
	 * @param ctx the parse tree
	 */
	enterIncrement?: (ctx: IncrementContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.increment`.
	 * @param ctx the parse tree
	 */
	exitIncrement?: (ctx: IncrementContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.decrement`.
	 * @param ctx the parse tree
	 */
	enterDecrement?: (ctx: DecrementContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.decrement`.
	 * @param ctx the parse tree
	 */
	exitDecrement?: (ctx: DecrementContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.method_call`.
	 * @param ctx the parse tree
	 */
	enterMethod_call?: (ctx: Method_callContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.method_call`.
	 * @param ctx the parse tree
	 */
	exitMethod_call?: (ctx: Method_callContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.method_name`.
	 * @param ctx the parse tree
	 */
	enterMethod_name?: (ctx: Method_nameContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.method_name`.
	 * @param ctx the parse tree
	 */
	exitMethod_name?: (ctx: Method_nameContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.location`.
	 * @param ctx the parse tree
	 */
	enterLocation?: (ctx: LocationContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.location`.
	 * @param ctx the parse tree
	 */
	exitLocation?: (ctx: LocationContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.extern_arg`.
	 * @param ctx the parse tree
	 */
	enterExtern_arg?: (ctx: Extern_argContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.extern_arg`.
	 * @param ctx the parse tree
	 */
	exitExtern_arg?: (ctx: Extern_argContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.bin_op`.
	 * @param ctx the parse tree
	 */
	enterBin_op?: (ctx: Bin_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.bin_op`.
	 * @param ctx the parse tree
	 */
	exitBin_op?: (ctx: Bin_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.arith_op`.
	 * @param ctx the parse tree
	 */
	enterArith_op?: (ctx: Arith_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.arith_op`.
	 * @param ctx the parse tree
	 */
	exitArith_op?: (ctx: Arith_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.rel_op`.
	 * @param ctx the parse tree
	 */
	enterRel_op?: (ctx: Rel_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.rel_op`.
	 * @param ctx the parse tree
	 */
	exitRel_op?: (ctx: Rel_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.eq_op`.
	 * @param ctx the parse tree
	 */
	enterEq_op?: (ctx: Eq_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.eq_op`.
	 * @param ctx the parse tree
	 */
	exitEq_op?: (ctx: Eq_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.cond_op`.
	 * @param ctx the parse tree
	 */
	enterCond_op?: (ctx: Cond_opContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.cond_op`.
	 * @param ctx the parse tree
	 */
	exitCond_op?: (ctx: Cond_opContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.literal`.
	 * @param ctx the parse tree
	 */
	enterLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.literal`.
	 * @param ctx the parse tree
	 */
	exitLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.int_literal`.
	 * @param ctx the parse tree
	 */
	enterInt_literal?: (ctx: Int_literalContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.int_literal`.
	 * @param ctx the parse tree
	 */
	exitInt_literal?: (ctx: Int_literalContext) => void;
	/**
	 * Enter a parse tree produced by `DecafParser.long_literal`.
	 * @param ctx the parse tree
	 */
	enterLong_literal?: (ctx: Long_literalContext) => void;
	/**
	 * Exit a parse tree produced by `DecafParser.long_literal`.
	 * @param ctx the parse tree
	 */
	exitLong_literal?: (ctx: Long_literalContext) => void;
}

