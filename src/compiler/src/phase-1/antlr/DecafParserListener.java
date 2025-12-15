// Generated from /Users/clairechen/sp25-team1-waffle/src/phase-1/.antlr/DecafParser.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link DecafParser}.
 */
public interface DecafParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link DecafParser#program}.
	 * @param ctx the parse tree
	 */
	void enterProgram(DecafParser.ProgramContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#program}.
	 * @param ctx the parse tree
	 */
	void exitProgram(DecafParser.ProgramContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#import_decl}.
	 * @param ctx the parse tree
	 */
	void enterImport_decl(DecafParser.Import_declContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#import_decl}.
	 * @param ctx the parse tree
	 */
	void exitImport_decl(DecafParser.Import_declContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#field_decl}.
	 * @param ctx the parse tree
	 */
	void enterField_decl(DecafParser.Field_declContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#field_decl}.
	 * @param ctx the parse tree
	 */
	void exitField_decl(DecafParser.Field_declContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#array_field_decl}.
	 * @param ctx the parse tree
	 */
	void enterArray_field_decl(DecafParser.Array_field_declContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#array_field_decl}.
	 * @param ctx the parse tree
	 */
	void exitArray_field_decl(DecafParser.Array_field_declContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#method_decl}.
	 * @param ctx the parse tree
	 */
	void enterMethod_decl(DecafParser.Method_declContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#method_decl}.
	 * @param ctx the parse tree
	 */
	void exitMethod_decl(DecafParser.Method_declContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#block}.
	 * @param ctx the parse tree
	 */
	void enterBlock(DecafParser.BlockContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#block}.
	 * @param ctx the parse tree
	 */
	void exitBlock(DecafParser.BlockContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#type}.
	 * @param ctx the parse tree
	 */
	void enterType(DecafParser.TypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#type}.
	 * @param ctx the parse tree
	 */
	void exitType(DecafParser.TypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#statement}.
	 * @param ctx the parse tree
	 */
	void enterStatement(DecafParser.StatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#statement}.
	 * @param ctx the parse tree
	 */
	void exitStatement(DecafParser.StatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#if_stmt}.
	 * @param ctx the parse tree
	 */
	void enterIf_stmt(DecafParser.If_stmtContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#if_stmt}.
	 * @param ctx the parse tree
	 */
	void exitIf_stmt(DecafParser.If_stmtContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#for_stmt}.
	 * @param ctx the parse tree
	 */
	void enterFor_stmt(DecafParser.For_stmtContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#for_stmt}.
	 * @param ctx the parse tree
	 */
	void exitFor_stmt(DecafParser.For_stmtContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#while_stmt}.
	 * @param ctx the parse tree
	 */
	void enterWhile_stmt(DecafParser.While_stmtContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#while_stmt}.
	 * @param ctx the parse tree
	 */
	void exitWhile_stmt(DecafParser.While_stmtContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#return_stmt}.
	 * @param ctx the parse tree
	 */
	void enterReturn_stmt(DecafParser.Return_stmtContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#return_stmt}.
	 * @param ctx the parse tree
	 */
	void exitReturn_stmt(DecafParser.Return_stmtContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#for_update}.
	 * @param ctx the parse tree
	 */
	void enterFor_update(DecafParser.For_updateContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#for_update}.
	 * @param ctx the parse tree
	 */
	void exitFor_update(DecafParser.For_updateContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#assign_expr}.
	 * @param ctx the parse tree
	 */
	void enterAssign_expr(DecafParser.Assign_exprContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#assign_expr}.
	 * @param ctx the parse tree
	 */
	void exitAssign_expr(DecafParser.Assign_exprContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#assign_op}.
	 * @param ctx the parse tree
	 */
	void enterAssign_op(DecafParser.Assign_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#assign_op}.
	 * @param ctx the parse tree
	 */
	void exitAssign_op(DecafParser.Assign_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#increment}.
	 * @param ctx the parse tree
	 */
	void enterIncrement(DecafParser.IncrementContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#increment}.
	 * @param ctx the parse tree
	 */
	void exitIncrement(DecafParser.IncrementContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#method_call}.
	 * @param ctx the parse tree
	 */
	void enterMethod_call(DecafParser.Method_callContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#method_call}.
	 * @param ctx the parse tree
	 */
	void exitMethod_call(DecafParser.Method_callContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#method_name}.
	 * @param ctx the parse tree
	 */
	void enterMethod_name(DecafParser.Method_nameContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#method_name}.
	 * @param ctx the parse tree
	 */
	void exitMethod_name(DecafParser.Method_nameContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#location}.
	 * @param ctx the parse tree
	 */
	void enterLocation(DecafParser.LocationContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#location}.
	 * @param ctx the parse tree
	 */
	void exitLocation(DecafParser.LocationContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterExpr(DecafParser.ExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitExpr(DecafParser.ExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#extern_arg}.
	 * @param ctx the parse tree
	 */
	void enterExtern_arg(DecafParser.Extern_argContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#extern_arg}.
	 * @param ctx the parse tree
	 */
	void exitExtern_arg(DecafParser.Extern_argContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#bin_op}.
	 * @param ctx the parse tree
	 */
	void enterBin_op(DecafParser.Bin_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#bin_op}.
	 * @param ctx the parse tree
	 */
	void exitBin_op(DecafParser.Bin_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#arith_op}.
	 * @param ctx the parse tree
	 */
	void enterArith_op(DecafParser.Arith_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#arith_op}.
	 * @param ctx the parse tree
	 */
	void exitArith_op(DecafParser.Arith_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#rel_op}.
	 * @param ctx the parse tree
	 */
	void enterRel_op(DecafParser.Rel_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#rel_op}.
	 * @param ctx the parse tree
	 */
	void exitRel_op(DecafParser.Rel_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#eq_op}.
	 * @param ctx the parse tree
	 */
	void enterEq_op(DecafParser.Eq_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#eq_op}.
	 * @param ctx the parse tree
	 */
	void exitEq_op(DecafParser.Eq_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#cond_op}.
	 * @param ctx the parse tree
	 */
	void enterCond_op(DecafParser.Cond_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#cond_op}.
	 * @param ctx the parse tree
	 */
	void exitCond_op(DecafParser.Cond_opContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterLiteral(DecafParser.LiteralContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitLiteral(DecafParser.LiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#int_literal}.
	 * @param ctx the parse tree
	 */
	void enterInt_literal(DecafParser.Int_literalContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#int_literal}.
	 * @param ctx the parse tree
	 */
	void exitInt_literal(DecafParser.Int_literalContext ctx);
	/**
	 * Enter a parse tree produced by {@link DecafParser#long_literal}.
	 * @param ctx the parse tree
	 */
	void enterLong_literal(DecafParser.Long_literalContext ctx);
	/**
	 * Exit a parse tree produced by {@link DecafParser#long_literal}.
	 * @param ctx the parse tree
	 */
	void exitLong_literal(DecafParser.Long_literalContext ctx);
}