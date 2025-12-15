// Generated from /Users/clairechen/sp25-team1-waffle/src/phase-1/.antlr/DecafParser.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class DecafParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		IMPORT=1, VOID=2, RETURN=3, IF=4, ELSE=5, FOR=6, WHILE=7, BREAK=8, CONTINUE=9, 
		LEN=10, INT=11, LONG=12, BOOL=13, ASSIGN=14, PLUS=15, MINUS=16, MULTIPLY=17, 
		DIVIDE=18, MODULO=19, INCREMENT=20, DECREMENT=21, EQUAL=22, NOT_EQUAL=23, 
		LESS_THAN=24, GREATER_THAN=25, LESS_EQUAL=26, GREATER_EQUAL=27, AND=28, 
		OR=29, NOT=30, LEFT_PAREN=31, RIGHT_PAREN=32, LEFT_BRACE=33, RIGHT_BRACE=34, 
		LEFT_BRACKET=35, RIGHT_BRACKET=36, SEMI=37, COMMA=38, LONGHEXLITERAL=39, 
		LONGDECLITERAL=40, DECIMALLITERAL=41, HEXLITERAL=42, CHARLITERAL=43, STRINGLITERAL=44, 
		BOOLLITERAL=45, ID=46, WS=47, LINE_COMMENT=48, BLOCK_COMMENT=49;
	public static final int
		RULE_program = 0, RULE_import_decl = 1, RULE_field_decl = 2, RULE_array_field_decl = 3, 
		RULE_method_decl = 4, RULE_block = 5, RULE_type = 6, RULE_statement = 7, 
		RULE_if_stmt = 8, RULE_for_stmt = 9, RULE_while_stmt = 10, RULE_return_stmt = 11, 
		RULE_for_update = 12, RULE_assign_expr = 13, RULE_assign_op = 14, RULE_increment = 15, 
		RULE_method_call = 16, RULE_method_name = 17, RULE_location = 18, RULE_expr = 19, 
		RULE_extern_arg = 20, RULE_bin_op = 21, RULE_arith_op = 22, RULE_rel_op = 23, 
		RULE_eq_op = 24, RULE_cond_op = 25, RULE_literal = 26, RULE_int_literal = 27, 
		RULE_long_literal = 28;
	private static String[] makeRuleNames() {
		return new String[] {
			"program", "import_decl", "field_decl", "array_field_decl", "method_decl", 
			"block", "type", "statement", "if_stmt", "for_stmt", "while_stmt", "return_stmt", 
			"for_update", "assign_expr", "assign_op", "increment", "method_call", 
			"method_name", "location", "expr", "extern_arg", "bin_op", "arith_op", 
			"rel_op", "eq_op", "cond_op", "literal", "int_literal", "long_literal"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'import'", "'void'", "'return'", "'if'", "'else'", "'for'", "'while'", 
			"'break'", "'continue'", "'len'", "'int'", "'long'", "'bool'", "'='", 
			"'+'", "'-'", "'*'", "'/'", "'%'", "'++'", "'--'", "'=='", "'!='", "'<'", 
			"'>'", "'<='", "'>='", "'&&'", "'||'", "'!'", "'('", "')'", "'{'", "'}'", 
			"'['", "']'", "';'", "','"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "IMPORT", "VOID", "RETURN", "IF", "ELSE", "FOR", "WHILE", "BREAK", 
			"CONTINUE", "LEN", "INT", "LONG", "BOOL", "ASSIGN", "PLUS", "MINUS", 
			"MULTIPLY", "DIVIDE", "MODULO", "INCREMENT", "DECREMENT", "EQUAL", "NOT_EQUAL", 
			"LESS_THAN", "GREATER_THAN", "LESS_EQUAL", "GREATER_EQUAL", "AND", "OR", 
			"NOT", "LEFT_PAREN", "RIGHT_PAREN", "LEFT_BRACE", "RIGHT_BRACE", "LEFT_BRACKET", 
			"RIGHT_BRACKET", "SEMI", "COMMA", "LONGHEXLITERAL", "LONGDECLITERAL", 
			"DECIMALLITERAL", "HEXLITERAL", "CHARLITERAL", "STRINGLITERAL", "BOOLLITERAL", 
			"ID", "WS", "LINE_COMMENT", "BLOCK_COMMENT"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "DecafParser.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public DecafParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ProgramContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(DecafParser.EOF, 0); }
		public List<Import_declContext> import_decl() {
			return getRuleContexts(Import_declContext.class);
		}
		public Import_declContext import_decl(int i) {
			return getRuleContext(Import_declContext.class,i);
		}
		public List<Field_declContext> field_decl() {
			return getRuleContexts(Field_declContext.class);
		}
		public Field_declContext field_decl(int i) {
			return getRuleContext(Field_declContext.class,i);
		}
		public List<Method_declContext> method_decl() {
			return getRuleContexts(Method_declContext.class);
		}
		public Method_declContext method_decl(int i) {
			return getRuleContext(Method_declContext.class,i);
		}
		public ProgramContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_program; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterProgram(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitProgram(this);
		}
	}

	public final ProgramContext program() throws RecognitionException {
		ProgramContext _localctx = new ProgramContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_program);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(61);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==IMPORT) {
				{
				{
				setState(58);
				import_decl();
				}
				}
				setState(63);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(67);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,1,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(64);
					field_decl();
					}
					} 
				}
				setState(69);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,1,_ctx);
			}
			setState(73);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & 14340L) != 0)) {
				{
				{
				setState(70);
				method_decl();
				}
				}
				setState(75);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(76);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Import_declContext extends ParserRuleContext {
		public TerminalNode IMPORT() { return getToken(DecafParser.IMPORT, 0); }
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public TerminalNode SEMI() { return getToken(DecafParser.SEMI, 0); }
		public Import_declContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_import_decl; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterImport_decl(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitImport_decl(this);
		}
	}

	public final Import_declContext import_decl() throws RecognitionException {
		Import_declContext _localctx = new Import_declContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_import_decl);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(78);
			match(IMPORT);
			setState(79);
			match(ID);
			setState(80);
			match(SEMI);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Field_declContext extends ParserRuleContext {
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public TerminalNode SEMI() { return getToken(DecafParser.SEMI, 0); }
		public List<TerminalNode> ID() { return getTokens(DecafParser.ID); }
		public TerminalNode ID(int i) {
			return getToken(DecafParser.ID, i);
		}
		public List<Array_field_declContext> array_field_decl() {
			return getRuleContexts(Array_field_declContext.class);
		}
		public Array_field_declContext array_field_decl(int i) {
			return getRuleContext(Array_field_declContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(DecafParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(DecafParser.COMMA, i);
		}
		public Field_declContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_field_decl; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterField_decl(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitField_decl(this);
		}
	}

	public final Field_declContext field_decl() throws RecognitionException {
		Field_declContext _localctx = new Field_declContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_field_decl);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(82);
			type();
			setState(85);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,3,_ctx) ) {
			case 1:
				{
				setState(83);
				match(ID);
				}
				break;
			case 2:
				{
				setState(84);
				array_field_decl();
				}
				break;
			}
			setState(94);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==COMMA) {
				{
				{
				setState(87);
				match(COMMA);
				setState(90);
				_errHandler.sync(this);
				switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
				case 1:
					{
					setState(88);
					match(ID);
					}
					break;
				case 2:
					{
					setState(89);
					array_field_decl();
					}
					break;
				}
				}
				}
				setState(96);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(97);
			match(SEMI);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Array_field_declContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public TerminalNode LEFT_BRACKET() { return getToken(DecafParser.LEFT_BRACKET, 0); }
		public Int_literalContext int_literal() {
			return getRuleContext(Int_literalContext.class,0);
		}
		public TerminalNode RIGHT_BRACKET() { return getToken(DecafParser.RIGHT_BRACKET, 0); }
		public Array_field_declContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_array_field_decl; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterArray_field_decl(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitArray_field_decl(this);
		}
	}

	public final Array_field_declContext array_field_decl() throws RecognitionException {
		Array_field_declContext _localctx = new Array_field_declContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_array_field_decl);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(99);
			match(ID);
			setState(100);
			match(LEFT_BRACKET);
			setState(101);
			int_literal();
			setState(102);
			match(RIGHT_BRACKET);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Method_declContext extends ParserRuleContext {
		public List<TerminalNode> ID() { return getTokens(DecafParser.ID); }
		public TerminalNode ID(int i) {
			return getToken(DecafParser.ID, i);
		}
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public BlockContext block() {
			return getRuleContext(BlockContext.class,0);
		}
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public TerminalNode VOID() { return getToken(DecafParser.VOID, 0); }
		public List<TerminalNode> COMMA() { return getTokens(DecafParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(DecafParser.COMMA, i);
		}
		public Method_declContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_method_decl; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterMethod_decl(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitMethod_decl(this);
		}
	}

	public final Method_declContext method_decl() throws RecognitionException {
		Method_declContext _localctx = new Method_declContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_method_decl);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(106);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case INT:
			case LONG:
			case BOOL:
				{
				setState(104);
				type();
				}
				break;
			case VOID:
				{
				setState(105);
				match(VOID);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			setState(108);
			match(ID);
			setState(109);
			match(LEFT_PAREN);
			setState(121);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 14336L) != 0)) {
				{
				setState(110);
				type();
				setState(111);
				match(ID);
				setState(118);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==COMMA) {
					{
					{
					setState(112);
					match(COMMA);
					setState(113);
					type();
					setState(114);
					match(ID);
					}
					}
					setState(120);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
			}

			setState(123);
			match(RIGHT_PAREN);
			setState(124);
			block();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class BlockContext extends ParserRuleContext {
		public TerminalNode LEFT_BRACE() { return getToken(DecafParser.LEFT_BRACE, 0); }
		public TerminalNode RIGHT_BRACE() { return getToken(DecafParser.RIGHT_BRACE, 0); }
		public List<Field_declContext> field_decl() {
			return getRuleContexts(Field_declContext.class);
		}
		public Field_declContext field_decl(int i) {
			return getRuleContext(Field_declContext.class,i);
		}
		public List<StatementContext> statement() {
			return getRuleContexts(StatementContext.class);
		}
		public StatementContext statement(int i) {
			return getRuleContext(StatementContext.class,i);
		}
		public BlockContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_block; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterBlock(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitBlock(this);
		}
	}

	public final BlockContext block() throws RecognitionException {
		BlockContext _localctx = new BlockContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_block);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(126);
			match(LEFT_BRACE);
			setState(130);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & 14336L) != 0)) {
				{
				{
				setState(127);
				field_decl();
				}
				}
				setState(132);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(136);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & 70368744178648L) != 0)) {
				{
				{
				setState(133);
				statement();
				}
				}
				setState(138);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(139);
			match(RIGHT_BRACE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class TypeContext extends ParserRuleContext {
		public TerminalNode INT() { return getToken(DecafParser.INT, 0); }
		public TerminalNode LONG() { return getToken(DecafParser.LONG, 0); }
		public TerminalNode BOOL() { return getToken(DecafParser.BOOL, 0); }
		public TypeContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_type; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterType(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitType(this);
		}
	}

	public final TypeContext type() throws RecognitionException {
		TypeContext _localctx = new TypeContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_type);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(141);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 14336L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class StatementContext extends ParserRuleContext {
		public LocationContext location() {
			return getRuleContext(LocationContext.class,0);
		}
		public Assign_exprContext assign_expr() {
			return getRuleContext(Assign_exprContext.class,0);
		}
		public TerminalNode SEMI() { return getToken(DecafParser.SEMI, 0); }
		public Method_callContext method_call() {
			return getRuleContext(Method_callContext.class,0);
		}
		public If_stmtContext if_stmt() {
			return getRuleContext(If_stmtContext.class,0);
		}
		public For_stmtContext for_stmt() {
			return getRuleContext(For_stmtContext.class,0);
		}
		public While_stmtContext while_stmt() {
			return getRuleContext(While_stmtContext.class,0);
		}
		public Return_stmtContext return_stmt() {
			return getRuleContext(Return_stmtContext.class,0);
		}
		public TerminalNode BREAK() { return getToken(DecafParser.BREAK, 0); }
		public TerminalNode CONTINUE() { return getToken(DecafParser.CONTINUE, 0); }
		public StatementContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_statement; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterStatement(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitStatement(this);
		}
	}

	public final StatementContext statement() throws RecognitionException {
		StatementContext _localctx = new StatementContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_statement);
		try {
			setState(158);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,11,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(143);
				location();
				setState(144);
				assign_expr();
				setState(145);
				match(SEMI);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(147);
				method_call();
				setState(148);
				match(SEMI);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(150);
				if_stmt();
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(151);
				for_stmt();
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(152);
				while_stmt();
				}
				break;
			case 6:
				enterOuterAlt(_localctx, 6);
				{
				setState(153);
				return_stmt();
				}
				break;
			case 7:
				enterOuterAlt(_localctx, 7);
				{
				setState(154);
				match(BREAK);
				setState(155);
				match(SEMI);
				}
				break;
			case 8:
				enterOuterAlt(_localctx, 8);
				{
				setState(156);
				match(CONTINUE);
				setState(157);
				match(SEMI);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class If_stmtContext extends ParserRuleContext {
		public TerminalNode IF() { return getToken(DecafParser.IF, 0); }
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public List<BlockContext> block() {
			return getRuleContexts(BlockContext.class);
		}
		public BlockContext block(int i) {
			return getRuleContext(BlockContext.class,i);
		}
		public TerminalNode ELSE() { return getToken(DecafParser.ELSE, 0); }
		public If_stmtContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_if_stmt; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterIf_stmt(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitIf_stmt(this);
		}
	}

	public final If_stmtContext if_stmt() throws RecognitionException {
		If_stmtContext _localctx = new If_stmtContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_if_stmt);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(160);
			match(IF);
			setState(161);
			match(LEFT_PAREN);
			setState(162);
			expr(0);
			setState(163);
			match(RIGHT_PAREN);
			setState(164);
			block();
			setState(167);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==ELSE) {
				{
				setState(165);
				match(ELSE);
				setState(166);
				block();
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class For_stmtContext extends ParserRuleContext {
		public TerminalNode FOR() { return getToken(DecafParser.FOR, 0); }
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public TerminalNode ASSIGN() { return getToken(DecafParser.ASSIGN, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public List<TerminalNode> SEMI() { return getTokens(DecafParser.SEMI); }
		public TerminalNode SEMI(int i) {
			return getToken(DecafParser.SEMI, i);
		}
		public For_updateContext for_update() {
			return getRuleContext(For_updateContext.class,0);
		}
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public BlockContext block() {
			return getRuleContext(BlockContext.class,0);
		}
		public For_stmtContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_for_stmt; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterFor_stmt(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitFor_stmt(this);
		}
	}

	public final For_stmtContext for_stmt() throws RecognitionException {
		For_stmtContext _localctx = new For_stmtContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_for_stmt);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(169);
			match(FOR);
			setState(170);
			match(LEFT_PAREN);
			setState(171);
			match(ID);
			setState(172);
			match(ASSIGN);
			setState(173);
			expr(0);
			setState(174);
			match(SEMI);
			setState(175);
			expr(0);
			setState(176);
			match(SEMI);
			setState(177);
			for_update();
			setState(178);
			match(RIGHT_PAREN);
			setState(179);
			block();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class While_stmtContext extends ParserRuleContext {
		public TerminalNode WHILE() { return getToken(DecafParser.WHILE, 0); }
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public BlockContext block() {
			return getRuleContext(BlockContext.class,0);
		}
		public While_stmtContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_while_stmt; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterWhile_stmt(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitWhile_stmt(this);
		}
	}

	public final While_stmtContext while_stmt() throws RecognitionException {
		While_stmtContext _localctx = new While_stmtContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_while_stmt);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(181);
			match(WHILE);
			setState(182);
			match(LEFT_PAREN);
			setState(183);
			expr(0);
			setState(184);
			match(RIGHT_PAREN);
			setState(185);
			block();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Return_stmtContext extends ParserRuleContext {
		public TerminalNode RETURN() { return getToken(DecafParser.RETURN, 0); }
		public TerminalNode SEMI() { return getToken(DecafParser.SEMI, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public Return_stmtContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_return_stmt; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterReturn_stmt(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitReturn_stmt(this);
		}
	}

	public final Return_stmtContext return_stmt() throws RecognitionException {
		Return_stmtContext _localctx = new Return_stmtContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_return_stmt);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(187);
			match(RETURN);
			setState(189);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 122598767795200L) != 0)) {
				{
				setState(188);
				expr(0);
				}
			}

			setState(191);
			match(SEMI);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class For_updateContext extends ParserRuleContext {
		public LocationContext location() {
			return getRuleContext(LocationContext.class,0);
		}
		public Assign_exprContext assign_expr() {
			return getRuleContext(Assign_exprContext.class,0);
		}
		public For_updateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_for_update; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterFor_update(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitFor_update(this);
		}
	}

	public final For_updateContext for_update() throws RecognitionException {
		For_updateContext _localctx = new For_updateContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_for_update);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(193);
			location();
			setState(194);
			assign_expr();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Assign_exprContext extends ParserRuleContext {
		public Assign_opContext assign_op() {
			return getRuleContext(Assign_opContext.class,0);
		}
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public IncrementContext increment() {
			return getRuleContext(IncrementContext.class,0);
		}
		public Assign_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_assign_expr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterAssign_expr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitAssign_expr(this);
		}
	}

	public final Assign_exprContext assign_expr() throws RecognitionException {
		Assign_exprContext _localctx = new Assign_exprContext(_ctx, getState());
		enterRule(_localctx, 26, RULE_assign_expr);
		try {
			setState(200);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case ASSIGN:
			case PLUS:
			case MINUS:
			case MULTIPLY:
			case DIVIDE:
			case MODULO:
				enterOuterAlt(_localctx, 1);
				{
				setState(196);
				assign_op();
				setState(197);
				expr(0);
				}
				break;
			case INCREMENT:
			case DECREMENT:
				enterOuterAlt(_localctx, 2);
				{
				setState(199);
				increment();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Assign_opContext extends ParserRuleContext {
		public TerminalNode ASSIGN() { return getToken(DecafParser.ASSIGN, 0); }
		public TerminalNode PLUS() { return getToken(DecafParser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(DecafParser.MINUS, 0); }
		public TerminalNode MULTIPLY() { return getToken(DecafParser.MULTIPLY, 0); }
		public TerminalNode DIVIDE() { return getToken(DecafParser.DIVIDE, 0); }
		public TerminalNode MODULO() { return getToken(DecafParser.MODULO, 0); }
		public Assign_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_assign_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterAssign_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitAssign_op(this);
		}
	}

	public final Assign_opContext assign_op() throws RecognitionException {
		Assign_opContext _localctx = new Assign_opContext(_ctx, getState());
		enterRule(_localctx, 28, RULE_assign_op);
		try {
			setState(213);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case ASSIGN:
				enterOuterAlt(_localctx, 1);
				{
				setState(202);
				match(ASSIGN);
				}
				break;
			case PLUS:
				enterOuterAlt(_localctx, 2);
				{
				setState(203);
				match(PLUS);
				setState(204);
				match(ASSIGN);
				}
				break;
			case MINUS:
				enterOuterAlt(_localctx, 3);
				{
				setState(205);
				match(MINUS);
				setState(206);
				match(ASSIGN);
				}
				break;
			case MULTIPLY:
				enterOuterAlt(_localctx, 4);
				{
				setState(207);
				match(MULTIPLY);
				setState(208);
				match(ASSIGN);
				}
				break;
			case DIVIDE:
				enterOuterAlt(_localctx, 5);
				{
				setState(209);
				match(DIVIDE);
				setState(210);
				match(ASSIGN);
				}
				break;
			case MODULO:
				enterOuterAlt(_localctx, 6);
				{
				setState(211);
				match(MODULO);
				setState(212);
				match(ASSIGN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class IncrementContext extends ParserRuleContext {
		public TerminalNode INCREMENT() { return getToken(DecafParser.INCREMENT, 0); }
		public TerminalNode DECREMENT() { return getToken(DecafParser.DECREMENT, 0); }
		public IncrementContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_increment; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterIncrement(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitIncrement(this);
		}
	}

	public final IncrementContext increment() throws RecognitionException {
		IncrementContext _localctx = new IncrementContext(_ctx, getState());
		enterRule(_localctx, 30, RULE_increment);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(215);
			_la = _input.LA(1);
			if ( !(_la==INCREMENT || _la==DECREMENT) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Method_callContext extends ParserRuleContext {
		public Method_nameContext method_name() {
			return getRuleContext(Method_nameContext.class,0);
		}
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(DecafParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(DecafParser.COMMA, i);
		}
		public List<Extern_argContext> extern_arg() {
			return getRuleContexts(Extern_argContext.class);
		}
		public Extern_argContext extern_arg(int i) {
			return getRuleContext(Extern_argContext.class,i);
		}
		public Method_callContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_method_call; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterMethod_call(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitMethod_call(this);
		}
	}

	public final Method_callContext method_call() throws RecognitionException {
		Method_callContext _localctx = new Method_callContext(_ctx, getState());
		enterRule(_localctx, 32, RULE_method_call);
		int _la;
		try {
			setState(245);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,20,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(217);
				method_name();
				setState(218);
				match(LEFT_PAREN);
				setState(227);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 122598767795200L) != 0)) {
					{
					setState(219);
					expr(0);
					setState(224);
					_errHandler.sync(this);
					_la = _input.LA(1);
					while (_la==COMMA) {
						{
						{
						setState(220);
						match(COMMA);
						setState(221);
						expr(0);
						}
						}
						setState(226);
						_errHandler.sync(this);
						_la = _input.LA(1);
					}
					}
				}

				setState(229);
				match(RIGHT_PAREN);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(231);
				method_name();
				setState(232);
				match(LEFT_PAREN);
				setState(241);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 140190953839616L) != 0)) {
					{
					setState(233);
					extern_arg();
					setState(238);
					_errHandler.sync(this);
					_la = _input.LA(1);
					while (_la==COMMA) {
						{
						{
						setState(234);
						match(COMMA);
						setState(235);
						extern_arg();
						}
						}
						setState(240);
						_errHandler.sync(this);
						_la = _input.LA(1);
					}
					}
				}

				setState(243);
				match(RIGHT_PAREN);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Method_nameContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public Method_nameContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_method_name; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterMethod_name(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitMethod_name(this);
		}
	}

	public final Method_nameContext method_name() throws RecognitionException {
		Method_nameContext _localctx = new Method_nameContext(_ctx, getState());
		enterRule(_localctx, 34, RULE_method_name);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(247);
			match(ID);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LocationContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public TerminalNode LEFT_BRACKET() { return getToken(DecafParser.LEFT_BRACKET, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode RIGHT_BRACKET() { return getToken(DecafParser.RIGHT_BRACKET, 0); }
		public LocationContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_location; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterLocation(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitLocation(this);
		}
	}

	public final LocationContext location() throws RecognitionException {
		LocationContext _localctx = new LocationContext(_ctx, getState());
		enterRule(_localctx, 36, RULE_location);
		try {
			setState(255);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,21,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(249);
				match(ID);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				{
				setState(250);
				match(ID);
				setState(251);
				match(LEFT_BRACKET);
				setState(252);
				expr(0);
				setState(253);
				match(RIGHT_BRACKET);
				}
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ExprContext extends ParserRuleContext {
		public TerminalNode LEFT_PAREN() { return getToken(DecafParser.LEFT_PAREN, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode RIGHT_PAREN() { return getToken(DecafParser.RIGHT_PAREN, 0); }
		public TerminalNode MINUS() { return getToken(DecafParser.MINUS, 0); }
		public TerminalNode NOT() { return getToken(DecafParser.NOT, 0); }
		public TerminalNode INT() { return getToken(DecafParser.INT, 0); }
		public TerminalNode LONG() { return getToken(DecafParser.LONG, 0); }
		public TerminalNode LEN() { return getToken(DecafParser.LEN, 0); }
		public TerminalNode ID() { return getToken(DecafParser.ID, 0); }
		public LocationContext location() {
			return getRuleContext(LocationContext.class,0);
		}
		public Method_callContext method_call() {
			return getRuleContext(Method_callContext.class,0);
		}
		public LiteralContext literal() {
			return getRuleContext(LiteralContext.class,0);
		}
		public TerminalNode MULTIPLY() { return getToken(DecafParser.MULTIPLY, 0); }
		public TerminalNode DIVIDE() { return getToken(DecafParser.DIVIDE, 0); }
		public TerminalNode MODULO() { return getToken(DecafParser.MODULO, 0); }
		public TerminalNode PLUS() { return getToken(DecafParser.PLUS, 0); }
		public TerminalNode LESS_THAN() { return getToken(DecafParser.LESS_THAN, 0); }
		public TerminalNode GREATER_THAN() { return getToken(DecafParser.GREATER_THAN, 0); }
		public TerminalNode LESS_EQUAL() { return getToken(DecafParser.LESS_EQUAL, 0); }
		public TerminalNode GREATER_EQUAL() { return getToken(DecafParser.GREATER_EQUAL, 0); }
		public TerminalNode EQUAL() { return getToken(DecafParser.EQUAL, 0); }
		public TerminalNode NOT_EQUAL() { return getToken(DecafParser.NOT_EQUAL, 0); }
		public TerminalNode AND() { return getToken(DecafParser.AND, 0); }
		public TerminalNode OR() { return getToken(DecafParser.OR, 0); }
		public ExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_expr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitExpr(this);
		}
	}

	public final ExprContext expr() throws RecognitionException {
		return expr(0);
	}

	private ExprContext expr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		ExprContext _localctx = new ExprContext(_ctx, _parentState);
		ExprContext _prevctx = _localctx;
		int _startState = 38;
		enterRecursionRule(_localctx, 38, RULE_expr, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(278);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,22,_ctx) ) {
			case 1:
				{
				setState(258);
				match(LEFT_PAREN);
				setState(259);
				expr(0);
				setState(260);
				match(RIGHT_PAREN);
				}
				break;
			case 2:
				{
				setState(262);
				match(MINUS);
				setState(263);
				expr(13);
				}
				break;
			case 3:
				{
				setState(264);
				match(NOT);
				setState(265);
				expr(12);
				}
				break;
			case 4:
				{
				setState(266);
				_la = _input.LA(1);
				if ( !(_la==INT || _la==LONG) ) {
				_errHandler.recoverInline(this);
				}
				else {
					if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
					_errHandler.reportMatch(this);
					consume();
				}
				setState(267);
				match(LEFT_PAREN);
				setState(268);
				expr(0);
				setState(269);
				match(RIGHT_PAREN);
				}
				break;
			case 5:
				{
				setState(271);
				match(LEN);
				setState(272);
				match(LEFT_PAREN);
				setState(273);
				match(ID);
				setState(274);
				match(RIGHT_PAREN);
				}
				break;
			case 6:
				{
				setState(275);
				location();
				}
				break;
			case 7:
				{
				setState(276);
				method_call();
				}
				break;
			case 8:
				{
				setState(277);
				literal();
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(300);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,24,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(298);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,23,_ctx) ) {
					case 1:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(280);
						if (!(precpred(_ctx, 9))) throw new FailedPredicateException(this, "precpred(_ctx, 9)");
						setState(281);
						_la = _input.LA(1);
						if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 917504L) != 0)) ) {
						_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(282);
						expr(10);
						}
						break;
					case 2:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(283);
						if (!(precpred(_ctx, 8))) throw new FailedPredicateException(this, "precpred(_ctx, 8)");
						setState(284);
						_la = _input.LA(1);
						if ( !(_la==PLUS || _la==MINUS) ) {
						_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(285);
						expr(9);
						}
						break;
					case 3:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(286);
						if (!(precpred(_ctx, 7))) throw new FailedPredicateException(this, "precpred(_ctx, 7)");
						setState(287);
						_la = _input.LA(1);
						if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 251658240L) != 0)) ) {
						_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(288);
						expr(8);
						}
						break;
					case 4:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(289);
						if (!(precpred(_ctx, 6))) throw new FailedPredicateException(this, "precpred(_ctx, 6)");
						setState(290);
						_la = _input.LA(1);
						if ( !(_la==EQUAL || _la==NOT_EQUAL) ) {
						_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(291);
						expr(7);
						}
						break;
					case 5:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(292);
						if (!(precpred(_ctx, 5))) throw new FailedPredicateException(this, "precpred(_ctx, 5)");
						setState(293);
						match(AND);
						setState(294);
						expr(6);
						}
						break;
					case 6:
						{
						_localctx = new ExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(295);
						if (!(precpred(_ctx, 4))) throw new FailedPredicateException(this, "precpred(_ctx, 4)");
						setState(296);
						match(OR);
						setState(297);
						expr(5);
						}
						break;
					}
					} 
				}
				setState(302);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,24,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Extern_argContext extends ParserRuleContext {
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode STRINGLITERAL() { return getToken(DecafParser.STRINGLITERAL, 0); }
		public Extern_argContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_extern_arg; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterExtern_arg(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitExtern_arg(this);
		}
	}

	public final Extern_argContext extern_arg() throws RecognitionException {
		Extern_argContext _localctx = new Extern_argContext(_ctx, getState());
		enterRule(_localctx, 40, RULE_extern_arg);
		try {
			setState(305);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LEN:
			case INT:
			case LONG:
			case MINUS:
			case NOT:
			case LEFT_PAREN:
			case LONGHEXLITERAL:
			case LONGDECLITERAL:
			case DECIMALLITERAL:
			case HEXLITERAL:
			case CHARLITERAL:
			case BOOLLITERAL:
			case ID:
				enterOuterAlt(_localctx, 1);
				{
				setState(303);
				expr(0);
				}
				break;
			case STRINGLITERAL:
				enterOuterAlt(_localctx, 2);
				{
				setState(304);
				match(STRINGLITERAL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Bin_opContext extends ParserRuleContext {
		public Arith_opContext arith_op() {
			return getRuleContext(Arith_opContext.class,0);
		}
		public Rel_opContext rel_op() {
			return getRuleContext(Rel_opContext.class,0);
		}
		public Eq_opContext eq_op() {
			return getRuleContext(Eq_opContext.class,0);
		}
		public Cond_opContext cond_op() {
			return getRuleContext(Cond_opContext.class,0);
		}
		public Bin_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_bin_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterBin_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitBin_op(this);
		}
	}

	public final Bin_opContext bin_op() throws RecognitionException {
		Bin_opContext _localctx = new Bin_opContext(_ctx, getState());
		enterRule(_localctx, 42, RULE_bin_op);
		try {
			setState(311);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case PLUS:
			case MINUS:
			case MULTIPLY:
			case DIVIDE:
			case MODULO:
				enterOuterAlt(_localctx, 1);
				{
				setState(307);
				arith_op();
				}
				break;
			case LESS_THAN:
			case GREATER_THAN:
			case LESS_EQUAL:
			case GREATER_EQUAL:
				enterOuterAlt(_localctx, 2);
				{
				setState(308);
				rel_op();
				}
				break;
			case EQUAL:
			case NOT_EQUAL:
				enterOuterAlt(_localctx, 3);
				{
				setState(309);
				eq_op();
				}
				break;
			case AND:
			case OR:
				enterOuterAlt(_localctx, 4);
				{
				setState(310);
				cond_op();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Arith_opContext extends ParserRuleContext {
		public TerminalNode PLUS() { return getToken(DecafParser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(DecafParser.MINUS, 0); }
		public TerminalNode MULTIPLY() { return getToken(DecafParser.MULTIPLY, 0); }
		public TerminalNode DIVIDE() { return getToken(DecafParser.DIVIDE, 0); }
		public TerminalNode MODULO() { return getToken(DecafParser.MODULO, 0); }
		public Arith_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_arith_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterArith_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitArith_op(this);
		}
	}

	public final Arith_opContext arith_op() throws RecognitionException {
		Arith_opContext _localctx = new Arith_opContext(_ctx, getState());
		enterRule(_localctx, 44, RULE_arith_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(313);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 1015808L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Rel_opContext extends ParserRuleContext {
		public TerminalNode LESS_THAN() { return getToken(DecafParser.LESS_THAN, 0); }
		public TerminalNode GREATER_THAN() { return getToken(DecafParser.GREATER_THAN, 0); }
		public TerminalNode LESS_EQUAL() { return getToken(DecafParser.LESS_EQUAL, 0); }
		public TerminalNode GREATER_EQUAL() { return getToken(DecafParser.GREATER_EQUAL, 0); }
		public Rel_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_rel_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterRel_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitRel_op(this);
		}
	}

	public final Rel_opContext rel_op() throws RecognitionException {
		Rel_opContext _localctx = new Rel_opContext(_ctx, getState());
		enterRule(_localctx, 46, RULE_rel_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(315);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 251658240L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Eq_opContext extends ParserRuleContext {
		public TerminalNode EQUAL() { return getToken(DecafParser.EQUAL, 0); }
		public TerminalNode NOT_EQUAL() { return getToken(DecafParser.NOT_EQUAL, 0); }
		public Eq_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_eq_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterEq_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitEq_op(this);
		}
	}

	public final Eq_opContext eq_op() throws RecognitionException {
		Eq_opContext _localctx = new Eq_opContext(_ctx, getState());
		enterRule(_localctx, 48, RULE_eq_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(317);
			_la = _input.LA(1);
			if ( !(_la==EQUAL || _la==NOT_EQUAL) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Cond_opContext extends ParserRuleContext {
		public TerminalNode AND() { return getToken(DecafParser.AND, 0); }
		public TerminalNode OR() { return getToken(DecafParser.OR, 0); }
		public Cond_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_cond_op; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterCond_op(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitCond_op(this);
		}
	}

	public final Cond_opContext cond_op() throws RecognitionException {
		Cond_opContext _localctx = new Cond_opContext(_ctx, getState());
		enterRule(_localctx, 50, RULE_cond_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(319);
			_la = _input.LA(1);
			if ( !(_la==AND || _la==OR) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LiteralContext extends ParserRuleContext {
		public Int_literalContext int_literal() {
			return getRuleContext(Int_literalContext.class,0);
		}
		public TerminalNode MINUS() { return getToken(DecafParser.MINUS, 0); }
		public Long_literalContext long_literal() {
			return getRuleContext(Long_literalContext.class,0);
		}
		public TerminalNode CHARLITERAL() { return getToken(DecafParser.CHARLITERAL, 0); }
		public TerminalNode BOOLLITERAL() { return getToken(DecafParser.BOOLLITERAL, 0); }
		public LiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterLiteral(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitLiteral(this);
		}
	}

	public final LiteralContext literal() throws RecognitionException {
		LiteralContext _localctx = new LiteralContext(_ctx, getState());
		enterRule(_localctx, 52, RULE_literal);
		int _la;
		try {
			setState(328);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case MINUS:
			case DECIMALLITERAL:
			case HEXLITERAL:
				enterOuterAlt(_localctx, 1);
				{
				setState(322);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==MINUS) {
					{
					setState(321);
					match(MINUS);
					}
				}

				setState(324);
				int_literal();
				}
				break;
			case LONGHEXLITERAL:
			case LONGDECLITERAL:
				enterOuterAlt(_localctx, 2);
				{
				setState(325);
				long_literal();
				}
				break;
			case CHARLITERAL:
				enterOuterAlt(_localctx, 3);
				{
				setState(326);
				match(CHARLITERAL);
				}
				break;
			case BOOLLITERAL:
				enterOuterAlt(_localctx, 4);
				{
				setState(327);
				match(BOOLLITERAL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Int_literalContext extends ParserRuleContext {
		public TerminalNode DECIMALLITERAL() { return getToken(DecafParser.DECIMALLITERAL, 0); }
		public TerminalNode HEXLITERAL() { return getToken(DecafParser.HEXLITERAL, 0); }
		public Int_literalContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_int_literal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterInt_literal(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitInt_literal(this);
		}
	}

	public final Int_literalContext int_literal() throws RecognitionException {
		Int_literalContext _localctx = new Int_literalContext(_ctx, getState());
		enterRule(_localctx, 54, RULE_int_literal);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(330);
			_la = _input.LA(1);
			if ( !(_la==DECIMALLITERAL || _la==HEXLITERAL) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Long_literalContext extends ParserRuleContext {
		public TerminalNode LONGDECLITERAL() { return getToken(DecafParser.LONGDECLITERAL, 0); }
		public TerminalNode LONGHEXLITERAL() { return getToken(DecafParser.LONGHEXLITERAL, 0); }
		public Long_literalContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_long_literal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).enterLong_literal(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof DecafParserListener ) ((DecafParserListener)listener).exitLong_literal(this);
		}
	}

	public final Long_literalContext long_literal() throws RecognitionException {
		Long_literalContext _localctx = new Long_literalContext(_ctx, getState());
		enterRule(_localctx, 56, RULE_long_literal);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(332);
			_la = _input.LA(1);
			if ( !(_la==LONGHEXLITERAL || _la==LONGDECLITERAL) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 19:
			return expr_sempred((ExprContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean expr_sempred(ExprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 9);
		case 1:
			return precpred(_ctx, 8);
		case 2:
			return precpred(_ctx, 7);
		case 3:
			return precpred(_ctx, 6);
		case 4:
			return precpred(_ctx, 5);
		case 5:
			return precpred(_ctx, 4);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u00011\u014f\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b\u0007\u000b\u0002"+
		"\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002\u000f\u0007\u000f"+
		"\u0002\u0010\u0007\u0010\u0002\u0011\u0007\u0011\u0002\u0012\u0007\u0012"+
		"\u0002\u0013\u0007\u0013\u0002\u0014\u0007\u0014\u0002\u0015\u0007\u0015"+
		"\u0002\u0016\u0007\u0016\u0002\u0017\u0007\u0017\u0002\u0018\u0007\u0018"+
		"\u0002\u0019\u0007\u0019\u0002\u001a\u0007\u001a\u0002\u001b\u0007\u001b"+
		"\u0002\u001c\u0007\u001c\u0001\u0000\u0005\u0000<\b\u0000\n\u0000\f\u0000"+
		"?\t\u0000\u0001\u0000\u0005\u0000B\b\u0000\n\u0000\f\u0000E\t\u0000\u0001"+
		"\u0000\u0005\u0000H\b\u0000\n\u0000\f\u0000K\t\u0000\u0001\u0000\u0001"+
		"\u0000\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0003\u0002V\b\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0003\u0002[\b\u0002\u0005\u0002]\b\u0002\n\u0002\f\u0002`\t\u0002"+
		"\u0001\u0002\u0001\u0002\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003"+
		"\u0001\u0003\u0001\u0004\u0001\u0004\u0003\u0004k\b\u0004\u0001\u0004"+
		"\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004"+
		"\u0001\u0004\u0005\u0004u\b\u0004\n\u0004\f\u0004x\t\u0004\u0003\u0004"+
		"z\b\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005"+
		"\u0005\u0005\u0081\b\u0005\n\u0005\f\u0005\u0084\t\u0005\u0001\u0005\u0005"+
		"\u0005\u0087\b\u0005\n\u0005\f\u0005\u008a\t\u0005\u0001\u0005\u0001\u0005"+
		"\u0001\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007"+
		"\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007"+
		"\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0003\u0007"+
		"\u009f\b\u0007\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b"+
		"\u0003\b\u00a8\b\b\u0001\t\u0001\t\u0001\t\u0001\t\u0001\t\u0001\t\u0001"+
		"\t\u0001\t\u0001\t\u0001\t\u0001\t\u0001\t\u0001\n\u0001\n\u0001\n\u0001"+
		"\n\u0001\n\u0001\n\u0001\u000b\u0001\u000b\u0003\u000b\u00be\b\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\f\u0001\f\u0001\f\u0001\r\u0001\r\u0001\r\u0001"+
		"\r\u0003\r\u00c9\b\r\u0001\u000e\u0001\u000e\u0001\u000e\u0001\u000e\u0001"+
		"\u000e\u0001\u000e\u0001\u000e\u0001\u000e\u0001\u000e\u0001\u000e\u0001"+
		"\u000e\u0003\u000e\u00d6\b\u000e\u0001\u000f\u0001\u000f\u0001\u0010\u0001"+
		"\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0005\u0010\u00df\b\u0010\n"+
		"\u0010\f\u0010\u00e2\t\u0010\u0003\u0010\u00e4\b\u0010\u0001\u0010\u0001"+
		"\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0005"+
		"\u0010\u00ed\b\u0010\n\u0010\f\u0010\u00f0\t\u0010\u0003\u0010\u00f2\b"+
		"\u0010\u0001\u0010\u0001\u0010\u0003\u0010\u00f6\b\u0010\u0001\u0011\u0001"+
		"\u0011\u0001\u0012\u0001\u0012\u0001\u0012\u0001\u0012\u0001\u0012\u0001"+
		"\u0012\u0003\u0012\u0100\b\u0012\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0003"+
		"\u0013\u0117\b\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001"+
		"\u0013\u0001\u0013\u0005\u0013\u012b\b\u0013\n\u0013\f\u0013\u012e\t\u0013"+
		"\u0001\u0014\u0001\u0014\u0003\u0014\u0132\b\u0014\u0001\u0015\u0001\u0015"+
		"\u0001\u0015\u0001\u0015\u0003\u0015\u0138\b\u0015\u0001\u0016\u0001\u0016"+
		"\u0001\u0017\u0001\u0017\u0001\u0018\u0001\u0018\u0001\u0019\u0001\u0019"+
		"\u0001\u001a\u0003\u001a\u0143\b\u001a\u0001\u001a\u0001\u001a\u0001\u001a"+
		"\u0001\u001a\u0003\u001a\u0149\b\u001a\u0001\u001b\u0001\u001b\u0001\u001c"+
		"\u0001\u001c\u0001\u001c\u0000\u0001&\u001d\u0000\u0002\u0004\u0006\b"+
		"\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e \"$&(*,.02"+
		"468\u0000\u000b\u0001\u0000\u000b\r\u0001\u0000\u0014\u0015\u0001\u0000"+
		"\u000b\f\u0001\u0000\u0011\u0013\u0001\u0000\u000f\u0010\u0001\u0000\u0018"+
		"\u001b\u0001\u0000\u0016\u0017\u0001\u0000\u000f\u0013\u0001\u0000\u001c"+
		"\u001d\u0001\u0000)*\u0001\u0000\'(\u0166\u0000=\u0001\u0000\u0000\u0000"+
		"\u0002N\u0001\u0000\u0000\u0000\u0004R\u0001\u0000\u0000\u0000\u0006c"+
		"\u0001\u0000\u0000\u0000\bj\u0001\u0000\u0000\u0000\n~\u0001\u0000\u0000"+
		"\u0000\f\u008d\u0001\u0000\u0000\u0000\u000e\u009e\u0001\u0000\u0000\u0000"+
		"\u0010\u00a0\u0001\u0000\u0000\u0000\u0012\u00a9\u0001\u0000\u0000\u0000"+
		"\u0014\u00b5\u0001\u0000\u0000\u0000\u0016\u00bb\u0001\u0000\u0000\u0000"+
		"\u0018\u00c1\u0001\u0000\u0000\u0000\u001a\u00c8\u0001\u0000\u0000\u0000"+
		"\u001c\u00d5\u0001\u0000\u0000\u0000\u001e\u00d7\u0001\u0000\u0000\u0000"+
		" \u00f5\u0001\u0000\u0000\u0000\"\u00f7\u0001\u0000\u0000\u0000$\u00ff"+
		"\u0001\u0000\u0000\u0000&\u0116\u0001\u0000\u0000\u0000(\u0131\u0001\u0000"+
		"\u0000\u0000*\u0137\u0001\u0000\u0000\u0000,\u0139\u0001\u0000\u0000\u0000"+
		".\u013b\u0001\u0000\u0000\u00000\u013d\u0001\u0000\u0000\u00002\u013f"+
		"\u0001\u0000\u0000\u00004\u0148\u0001\u0000\u0000\u00006\u014a\u0001\u0000"+
		"\u0000\u00008\u014c\u0001\u0000\u0000\u0000:<\u0003\u0002\u0001\u0000"+
		";:\u0001\u0000\u0000\u0000<?\u0001\u0000\u0000\u0000=;\u0001\u0000\u0000"+
		"\u0000=>\u0001\u0000\u0000\u0000>C\u0001\u0000\u0000\u0000?=\u0001\u0000"+
		"\u0000\u0000@B\u0003\u0004\u0002\u0000A@\u0001\u0000\u0000\u0000BE\u0001"+
		"\u0000\u0000\u0000CA\u0001\u0000\u0000\u0000CD\u0001\u0000\u0000\u0000"+
		"DI\u0001\u0000\u0000\u0000EC\u0001\u0000\u0000\u0000FH\u0003\b\u0004\u0000"+
		"GF\u0001\u0000\u0000\u0000HK\u0001\u0000\u0000\u0000IG\u0001\u0000\u0000"+
		"\u0000IJ\u0001\u0000\u0000\u0000JL\u0001\u0000\u0000\u0000KI\u0001\u0000"+
		"\u0000\u0000LM\u0005\u0000\u0000\u0001M\u0001\u0001\u0000\u0000\u0000"+
		"NO\u0005\u0001\u0000\u0000OP\u0005.\u0000\u0000PQ\u0005%\u0000\u0000Q"+
		"\u0003\u0001\u0000\u0000\u0000RU\u0003\f\u0006\u0000SV\u0005.\u0000\u0000"+
		"TV\u0003\u0006\u0003\u0000US\u0001\u0000\u0000\u0000UT\u0001\u0000\u0000"+
		"\u0000V^\u0001\u0000\u0000\u0000WZ\u0005&\u0000\u0000X[\u0005.\u0000\u0000"+
		"Y[\u0003\u0006\u0003\u0000ZX\u0001\u0000\u0000\u0000ZY\u0001\u0000\u0000"+
		"\u0000[]\u0001\u0000\u0000\u0000\\W\u0001\u0000\u0000\u0000]`\u0001\u0000"+
		"\u0000\u0000^\\\u0001\u0000\u0000\u0000^_\u0001\u0000\u0000\u0000_a\u0001"+
		"\u0000\u0000\u0000`^\u0001\u0000\u0000\u0000ab\u0005%\u0000\u0000b\u0005"+
		"\u0001\u0000\u0000\u0000cd\u0005.\u0000\u0000de\u0005#\u0000\u0000ef\u0003"+
		"6\u001b\u0000fg\u0005$\u0000\u0000g\u0007\u0001\u0000\u0000\u0000hk\u0003"+
		"\f\u0006\u0000ik\u0005\u0002\u0000\u0000jh\u0001\u0000\u0000\u0000ji\u0001"+
		"\u0000\u0000\u0000kl\u0001\u0000\u0000\u0000lm\u0005.\u0000\u0000my\u0005"+
		"\u001f\u0000\u0000no\u0003\f\u0006\u0000ov\u0005.\u0000\u0000pq\u0005"+
		"&\u0000\u0000qr\u0003\f\u0006\u0000rs\u0005.\u0000\u0000su\u0001\u0000"+
		"\u0000\u0000tp\u0001\u0000\u0000\u0000ux\u0001\u0000\u0000\u0000vt\u0001"+
		"\u0000\u0000\u0000vw\u0001\u0000\u0000\u0000wz\u0001\u0000\u0000\u0000"+
		"xv\u0001\u0000\u0000\u0000yn\u0001\u0000\u0000\u0000yz\u0001\u0000\u0000"+
		"\u0000z{\u0001\u0000\u0000\u0000{|\u0005 \u0000\u0000|}\u0003\n\u0005"+
		"\u0000}\t\u0001\u0000\u0000\u0000~\u0082\u0005!\u0000\u0000\u007f\u0081"+
		"\u0003\u0004\u0002\u0000\u0080\u007f\u0001\u0000\u0000\u0000\u0081\u0084"+
		"\u0001\u0000\u0000\u0000\u0082\u0080\u0001\u0000\u0000\u0000\u0082\u0083"+
		"\u0001\u0000\u0000\u0000\u0083\u0088\u0001\u0000\u0000\u0000\u0084\u0082"+
		"\u0001\u0000\u0000\u0000\u0085\u0087\u0003\u000e\u0007\u0000\u0086\u0085"+
		"\u0001\u0000\u0000\u0000\u0087\u008a\u0001\u0000\u0000\u0000\u0088\u0086"+
		"\u0001\u0000\u0000\u0000\u0088\u0089\u0001\u0000\u0000\u0000\u0089\u008b"+
		"\u0001\u0000\u0000\u0000\u008a\u0088\u0001\u0000\u0000\u0000\u008b\u008c"+
		"\u0005\"\u0000\u0000\u008c\u000b\u0001\u0000\u0000\u0000\u008d\u008e\u0007"+
		"\u0000\u0000\u0000\u008e\r\u0001\u0000\u0000\u0000\u008f\u0090\u0003$"+
		"\u0012\u0000\u0090\u0091\u0003\u001a\r\u0000\u0091\u0092\u0005%\u0000"+
		"\u0000\u0092\u009f\u0001\u0000\u0000\u0000\u0093\u0094\u0003 \u0010\u0000"+
		"\u0094\u0095\u0005%\u0000\u0000\u0095\u009f\u0001\u0000\u0000\u0000\u0096"+
		"\u009f\u0003\u0010\b\u0000\u0097\u009f\u0003\u0012\t\u0000\u0098\u009f"+
		"\u0003\u0014\n\u0000\u0099\u009f\u0003\u0016\u000b\u0000\u009a\u009b\u0005"+
		"\b\u0000\u0000\u009b\u009f\u0005%\u0000\u0000\u009c\u009d\u0005\t\u0000"+
		"\u0000\u009d\u009f\u0005%\u0000\u0000\u009e\u008f\u0001\u0000\u0000\u0000"+
		"\u009e\u0093\u0001\u0000\u0000\u0000\u009e\u0096\u0001\u0000\u0000\u0000"+
		"\u009e\u0097\u0001\u0000\u0000\u0000\u009e\u0098\u0001\u0000\u0000\u0000"+
		"\u009e\u0099\u0001\u0000\u0000\u0000\u009e\u009a\u0001\u0000\u0000\u0000"+
		"\u009e\u009c\u0001\u0000\u0000\u0000\u009f\u000f\u0001\u0000\u0000\u0000"+
		"\u00a0\u00a1\u0005\u0004\u0000\u0000\u00a1\u00a2\u0005\u001f\u0000\u0000"+
		"\u00a2\u00a3\u0003&\u0013\u0000\u00a3\u00a4\u0005 \u0000\u0000\u00a4\u00a7"+
		"\u0003\n\u0005\u0000\u00a5\u00a6\u0005\u0005\u0000\u0000\u00a6\u00a8\u0003"+
		"\n\u0005\u0000\u00a7\u00a5\u0001\u0000\u0000\u0000\u00a7\u00a8\u0001\u0000"+
		"\u0000\u0000\u00a8\u0011\u0001\u0000\u0000\u0000\u00a9\u00aa\u0005\u0006"+
		"\u0000\u0000\u00aa\u00ab\u0005\u001f\u0000\u0000\u00ab\u00ac\u0005.\u0000"+
		"\u0000\u00ac\u00ad\u0005\u000e\u0000\u0000\u00ad\u00ae\u0003&\u0013\u0000"+
		"\u00ae\u00af\u0005%\u0000\u0000\u00af\u00b0\u0003&\u0013\u0000\u00b0\u00b1"+
		"\u0005%\u0000\u0000\u00b1\u00b2\u0003\u0018\f\u0000\u00b2\u00b3\u0005"+
		" \u0000\u0000\u00b3\u00b4\u0003\n\u0005\u0000\u00b4\u0013\u0001\u0000"+
		"\u0000\u0000\u00b5\u00b6\u0005\u0007\u0000\u0000\u00b6\u00b7\u0005\u001f"+
		"\u0000\u0000\u00b7\u00b8\u0003&\u0013\u0000\u00b8\u00b9\u0005 \u0000\u0000"+
		"\u00b9\u00ba\u0003\n\u0005\u0000\u00ba\u0015\u0001\u0000\u0000\u0000\u00bb"+
		"\u00bd\u0005\u0003\u0000\u0000\u00bc\u00be\u0003&\u0013\u0000\u00bd\u00bc"+
		"\u0001\u0000\u0000\u0000\u00bd\u00be\u0001\u0000\u0000\u0000\u00be\u00bf"+
		"\u0001\u0000\u0000\u0000\u00bf\u00c0\u0005%\u0000\u0000\u00c0\u0017\u0001"+
		"\u0000\u0000\u0000\u00c1\u00c2\u0003$\u0012\u0000\u00c2\u00c3\u0003\u001a"+
		"\r\u0000\u00c3\u0019\u0001\u0000\u0000\u0000\u00c4\u00c5\u0003\u001c\u000e"+
		"\u0000\u00c5\u00c6\u0003&\u0013\u0000\u00c6\u00c9\u0001\u0000\u0000\u0000"+
		"\u00c7\u00c9\u0003\u001e\u000f\u0000\u00c8\u00c4\u0001\u0000\u0000\u0000"+
		"\u00c8\u00c7\u0001\u0000\u0000\u0000\u00c9\u001b\u0001\u0000\u0000\u0000"+
		"\u00ca\u00d6\u0005\u000e\u0000\u0000\u00cb\u00cc\u0005\u000f\u0000\u0000"+
		"\u00cc\u00d6\u0005\u000e\u0000\u0000\u00cd\u00ce\u0005\u0010\u0000\u0000"+
		"\u00ce\u00d6\u0005\u000e\u0000\u0000\u00cf\u00d0\u0005\u0011\u0000\u0000"+
		"\u00d0\u00d6\u0005\u000e\u0000\u0000\u00d1\u00d2\u0005\u0012\u0000\u0000"+
		"\u00d2\u00d6\u0005\u000e\u0000\u0000\u00d3\u00d4\u0005\u0013\u0000\u0000"+
		"\u00d4\u00d6\u0005\u000e\u0000\u0000\u00d5\u00ca\u0001\u0000\u0000\u0000"+
		"\u00d5\u00cb\u0001\u0000\u0000\u0000\u00d5\u00cd\u0001\u0000\u0000\u0000"+
		"\u00d5\u00cf\u0001\u0000\u0000\u0000\u00d5\u00d1\u0001\u0000\u0000\u0000"+
		"\u00d5\u00d3\u0001\u0000\u0000\u0000\u00d6\u001d\u0001\u0000\u0000\u0000"+
		"\u00d7\u00d8\u0007\u0001\u0000\u0000\u00d8\u001f\u0001\u0000\u0000\u0000"+
		"\u00d9\u00da\u0003\"\u0011\u0000\u00da\u00e3\u0005\u001f\u0000\u0000\u00db"+
		"\u00e0\u0003&\u0013\u0000\u00dc\u00dd\u0005&\u0000\u0000\u00dd\u00df\u0003"+
		"&\u0013\u0000\u00de\u00dc\u0001\u0000\u0000\u0000\u00df\u00e2\u0001\u0000"+
		"\u0000\u0000\u00e0\u00de\u0001\u0000\u0000\u0000\u00e0\u00e1\u0001\u0000"+
		"\u0000\u0000\u00e1\u00e4\u0001\u0000\u0000\u0000\u00e2\u00e0\u0001\u0000"+
		"\u0000\u0000\u00e3\u00db\u0001\u0000\u0000\u0000\u00e3\u00e4\u0001\u0000"+
		"\u0000\u0000\u00e4\u00e5\u0001\u0000\u0000\u0000\u00e5\u00e6\u0005 \u0000"+
		"\u0000\u00e6\u00f6\u0001\u0000\u0000\u0000\u00e7\u00e8\u0003\"\u0011\u0000"+
		"\u00e8\u00f1\u0005\u001f\u0000\u0000\u00e9\u00ee\u0003(\u0014\u0000\u00ea"+
		"\u00eb\u0005&\u0000\u0000\u00eb\u00ed\u0003(\u0014\u0000\u00ec\u00ea\u0001"+
		"\u0000\u0000\u0000\u00ed\u00f0\u0001\u0000\u0000\u0000\u00ee\u00ec\u0001"+
		"\u0000\u0000\u0000\u00ee\u00ef\u0001\u0000\u0000\u0000\u00ef\u00f2\u0001"+
		"\u0000\u0000\u0000\u00f0\u00ee\u0001\u0000\u0000\u0000\u00f1\u00e9\u0001"+
		"\u0000\u0000\u0000\u00f1\u00f2\u0001\u0000\u0000\u0000\u00f2\u00f3\u0001"+
		"\u0000\u0000\u0000\u00f3\u00f4\u0005 \u0000\u0000\u00f4\u00f6\u0001\u0000"+
		"\u0000\u0000\u00f5\u00d9\u0001\u0000\u0000\u0000\u00f5\u00e7\u0001\u0000"+
		"\u0000\u0000\u00f6!\u0001\u0000\u0000\u0000\u00f7\u00f8\u0005.\u0000\u0000"+
		"\u00f8#\u0001\u0000\u0000\u0000\u00f9\u0100\u0005.\u0000\u0000\u00fa\u00fb"+
		"\u0005.\u0000\u0000\u00fb\u00fc\u0005#\u0000\u0000\u00fc\u00fd\u0003&"+
		"\u0013\u0000\u00fd\u00fe\u0005$\u0000\u0000\u00fe\u0100\u0001\u0000\u0000"+
		"\u0000\u00ff\u00f9\u0001\u0000\u0000\u0000\u00ff\u00fa\u0001\u0000\u0000"+
		"\u0000\u0100%\u0001\u0000\u0000\u0000\u0101\u0102\u0006\u0013\uffff\uffff"+
		"\u0000\u0102\u0103\u0005\u001f\u0000\u0000\u0103\u0104\u0003&\u0013\u0000"+
		"\u0104\u0105\u0005 \u0000\u0000\u0105\u0117\u0001\u0000\u0000\u0000\u0106"+
		"\u0107\u0005\u0010\u0000\u0000\u0107\u0117\u0003&\u0013\r\u0108\u0109"+
		"\u0005\u001e\u0000\u0000\u0109\u0117\u0003&\u0013\f\u010a\u010b\u0007"+
		"\u0002\u0000\u0000\u010b\u010c\u0005\u001f\u0000\u0000\u010c\u010d\u0003"+
		"&\u0013\u0000\u010d\u010e\u0005 \u0000\u0000\u010e\u0117\u0001\u0000\u0000"+
		"\u0000\u010f\u0110\u0005\n\u0000\u0000\u0110\u0111\u0005\u001f\u0000\u0000"+
		"\u0111\u0112\u0005.\u0000\u0000\u0112\u0117\u0005 \u0000\u0000\u0113\u0117"+
		"\u0003$\u0012\u0000\u0114\u0117\u0003 \u0010\u0000\u0115\u0117\u00034"+
		"\u001a\u0000\u0116\u0101\u0001\u0000\u0000\u0000\u0116\u0106\u0001\u0000"+
		"\u0000\u0000\u0116\u0108\u0001\u0000\u0000\u0000\u0116\u010a\u0001\u0000"+
		"\u0000\u0000\u0116\u010f\u0001\u0000\u0000\u0000\u0116\u0113\u0001\u0000"+
		"\u0000\u0000\u0116\u0114\u0001\u0000\u0000\u0000\u0116\u0115\u0001\u0000"+
		"\u0000\u0000\u0117\u012c\u0001\u0000\u0000\u0000\u0118\u0119\n\t\u0000"+
		"\u0000\u0119\u011a\u0007\u0003\u0000\u0000\u011a\u012b\u0003&\u0013\n"+
		"\u011b\u011c\n\b\u0000\u0000\u011c\u011d\u0007\u0004\u0000\u0000\u011d"+
		"\u012b\u0003&\u0013\t\u011e\u011f\n\u0007\u0000\u0000\u011f\u0120\u0007"+
		"\u0005\u0000\u0000\u0120\u012b\u0003&\u0013\b\u0121\u0122\n\u0006\u0000"+
		"\u0000\u0122\u0123\u0007\u0006\u0000\u0000\u0123\u012b\u0003&\u0013\u0007"+
		"\u0124\u0125\n\u0005\u0000\u0000\u0125\u0126\u0005\u001c\u0000\u0000\u0126"+
		"\u012b\u0003&\u0013\u0006\u0127\u0128\n\u0004\u0000\u0000\u0128\u0129"+
		"\u0005\u001d\u0000\u0000\u0129\u012b\u0003&\u0013\u0005\u012a\u0118\u0001"+
		"\u0000\u0000\u0000\u012a\u011b\u0001\u0000\u0000\u0000\u012a\u011e\u0001"+
		"\u0000\u0000\u0000\u012a\u0121\u0001\u0000\u0000\u0000\u012a\u0124\u0001"+
		"\u0000\u0000\u0000\u012a\u0127\u0001\u0000\u0000\u0000\u012b\u012e\u0001"+
		"\u0000\u0000\u0000\u012c\u012a\u0001\u0000\u0000\u0000\u012c\u012d\u0001"+
		"\u0000\u0000\u0000\u012d\'\u0001\u0000\u0000\u0000\u012e\u012c\u0001\u0000"+
		"\u0000\u0000\u012f\u0132\u0003&\u0013\u0000\u0130\u0132\u0005,\u0000\u0000"+
		"\u0131\u012f\u0001\u0000\u0000\u0000\u0131\u0130\u0001\u0000\u0000\u0000"+
		"\u0132)\u0001\u0000\u0000\u0000\u0133\u0138\u0003,\u0016\u0000\u0134\u0138"+
		"\u0003.\u0017\u0000\u0135\u0138\u00030\u0018\u0000\u0136\u0138\u00032"+
		"\u0019\u0000\u0137\u0133\u0001\u0000\u0000\u0000\u0137\u0134\u0001\u0000"+
		"\u0000\u0000\u0137\u0135\u0001\u0000\u0000\u0000\u0137\u0136\u0001\u0000"+
		"\u0000\u0000\u0138+\u0001\u0000\u0000\u0000\u0139\u013a\u0007\u0007\u0000"+
		"\u0000\u013a-\u0001\u0000\u0000\u0000\u013b\u013c\u0007\u0005\u0000\u0000"+
		"\u013c/\u0001\u0000\u0000\u0000\u013d\u013e\u0007\u0006\u0000\u0000\u013e"+
		"1\u0001\u0000\u0000\u0000\u013f\u0140\u0007\b\u0000\u0000\u01403\u0001"+
		"\u0000\u0000\u0000\u0141\u0143\u0005\u0010\u0000\u0000\u0142\u0141\u0001"+
		"\u0000\u0000\u0000\u0142\u0143\u0001\u0000\u0000\u0000\u0143\u0144\u0001"+
		"\u0000\u0000\u0000\u0144\u0149\u00036\u001b\u0000\u0145\u0149\u00038\u001c"+
		"\u0000\u0146\u0149\u0005+\u0000\u0000\u0147\u0149\u0005-\u0000\u0000\u0148"+
		"\u0142\u0001\u0000\u0000\u0000\u0148\u0145\u0001\u0000\u0000\u0000\u0148"+
		"\u0146\u0001\u0000\u0000\u0000\u0148\u0147\u0001\u0000\u0000\u0000\u0149"+
		"5\u0001\u0000\u0000\u0000\u014a\u014b\u0007\t\u0000\u0000\u014b7\u0001"+
		"\u0000\u0000\u0000\u014c\u014d\u0007\n\u0000\u0000\u014d9\u0001\u0000"+
		"\u0000\u0000\u001d=CIUZ^jvy\u0082\u0088\u009e\u00a7\u00bd\u00c8\u00d5"+
		"\u00e0\u00e3\u00ee\u00f1\u00f5\u00ff\u0116\u012a\u012c\u0131\u0137\u0142"+
		"\u0148";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}