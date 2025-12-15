// Generated from DecafParser.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import DecafParserListener from "./DecafParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class DecafParser extends Parser {
	public static readonly IMPORT = 1;
	public static readonly VOID = 2;
	public static readonly RETURN = 3;
	public static readonly IF = 4;
	public static readonly ELSE = 5;
	public static readonly FOR = 6;
	public static readonly WHILE = 7;
	public static readonly BREAK = 8;
	public static readonly CONTINUE = 9;
	public static readonly LEN = 10;
	public static readonly INT = 11;
	public static readonly LONG = 12;
	public static readonly BOOL = 13;
	public static readonly ASSIGN = 14;
	public static readonly PLUS = 15;
	public static readonly MINUS = 16;
	public static readonly MULTIPLY = 17;
	public static readonly DIVIDE = 18;
	public static readonly MODULO = 19;
	public static readonly INCREMENT = 20;
	public static readonly EQUAL = 21;
	public static readonly NOT_EQUAL = 22;
	public static readonly LESS_THAN = 23;
	public static readonly GREATER_THAN = 24;
	public static readonly LESS_EQUAL = 25;
	public static readonly GREATER_EQUAL = 26;
	public static readonly AND = 27;
	public static readonly OR = 28;
	public static readonly NOT = 29;
	public static readonly LEFT_PAREN = 30;
	public static readonly RIGHT_PAREN = 31;
	public static readonly LEFT_BRACE = 32;
	public static readonly RIGHT_BRACE = 33;
	public static readonly LEFT_BRACKET = 34;
	public static readonly RIGHT_BRACKET = 35;
	public static readonly SEMI = 36;
	public static readonly COMMA = 37;
	public static readonly LONGHEXLITERAL = 38;
	public static readonly LONGDECLITERAL = 39;
	public static readonly DECIMALLITERAL = 40;
	public static readonly HEXLITERAL = 41;
	public static readonly CHARLITERAL = 42;
	public static readonly STRINGLITERAL = 43;
	public static readonly BOOLLITERAL = 44;
	public static readonly ID = 45;
	public static readonly WS = 46;
	public static readonly LINE_COMMENT = 47;
	public static readonly BLOCK_COMMENT = 48;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_program = 0;
	public static readonly RULE_import_decl = 1;
	public static readonly RULE_field_decl = 2;
	public static readonly RULE_array_field_decl = 3;
	public static readonly RULE_method_decl = 4;
	public static readonly RULE_block = 5;
	public static readonly RULE_type = 6;
	public static readonly RULE_statement = 7;
	public static readonly RULE_if_stmt = 8;
	public static readonly RULE_for_stmt = 9;
	public static readonly RULE_while_stmt = 10;
	public static readonly RULE_return_stmt = 11;
	public static readonly RULE_for_update = 12;
	public static readonly RULE_assign_expr = 13;
	public static readonly RULE_assign_op = 14;
	public static readonly RULE_increment = 15;
	public static readonly RULE_decrement = 16;
	public static readonly RULE_method_call = 17;
	public static readonly RULE_method_name = 18;
	public static readonly RULE_location = 19;
	public static readonly RULE_expr = 20;
	public static readonly RULE_extern_arg = 21;
	public static readonly RULE_bin_op = 22;
	public static readonly RULE_arith_op = 23;
	public static readonly RULE_rel_op = 24;
	public static readonly RULE_eq_op = 25;
	public static readonly RULE_cond_op = 26;
	public static readonly RULE_literal = 27;
	public static readonly RULE_int_literal = 28;
	public static readonly RULE_long_literal = 29;
	public static readonly literalNames: (string | null)[] = [ null, "'import'", 
                                                            "'void'", "'return'", 
                                                            "'if'", "'else'", 
                                                            "'for'", "'while'", 
                                                            "'break'", "'continue'", 
                                                            "'len'", "'int'", 
                                                            "'long'", "'bool'", 
                                                            "'='", "'+'", 
                                                            "'-'", "'*'", 
                                                            "'/'", "'%'", 
                                                            "'++'", "'=='", 
                                                            "'!='", "'<'", 
                                                            "'>'", "'<='", 
                                                            "'>='", "'&&'", 
                                                            "'||'", "'!'", 
                                                            "'('", "')'", 
                                                            "'{'", "'}'", 
                                                            "'['", "']'", 
                                                            "';'", "','" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "IMPORT", 
                                                             "VOID", "RETURN", 
                                                             "IF", "ELSE", 
                                                             "FOR", "WHILE", 
                                                             "BREAK", "CONTINUE", 
                                                             "LEN", "INT", 
                                                             "LONG", "BOOL", 
                                                             "ASSIGN", "PLUS", 
                                                             "MINUS", "MULTIPLY", 
                                                             "DIVIDE", "MODULO", 
                                                             "INCREMENT", 
                                                             "EQUAL", "NOT_EQUAL", 
                                                             "LESS_THAN", 
                                                             "GREATER_THAN", 
                                                             "LESS_EQUAL", 
                                                             "GREATER_EQUAL", 
                                                             "AND", "OR", 
                                                             "NOT", "LEFT_PAREN", 
                                                             "RIGHT_PAREN", 
                                                             "LEFT_BRACE", 
                                                             "RIGHT_BRACE", 
                                                             "LEFT_BRACKET", 
                                                             "RIGHT_BRACKET", 
                                                             "SEMI", "COMMA", 
                                                             "LONGHEXLITERAL", 
                                                             "LONGDECLITERAL", 
                                                             "DECIMALLITERAL", 
                                                             "HEXLITERAL", 
                                                             "CHARLITERAL", 
                                                             "STRINGLITERAL", 
                                                             "BOOLLITERAL", 
                                                             "ID", "WS", 
                                                             "LINE_COMMENT", 
                                                             "BLOCK_COMMENT" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"program", "import_decl", "field_decl", "array_field_decl", "method_decl", 
		"block", "type", "statement", "if_stmt", "for_stmt", "while_stmt", "return_stmt", 
		"for_update", "assign_expr", "assign_op", "increment", "decrement", "method_call", 
		"method_name", "location", "expr", "extern_arg", "bin_op", "arith_op", 
		"rel_op", "eq_op", "cond_op", "literal", "int_literal", "long_literal",
	];
	public get grammarFileName(): string { return "DecafParser.g4"; }
	public get literalNames(): (string | null)[] { return DecafParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return DecafParser.symbolicNames; }
	public get ruleNames(): string[] { return DecafParser.ruleNames; }
	public get serializedATN(): number[] { return DecafParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, DecafParser._ATN, DecafParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, DecafParser.RULE_program);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 63;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 60;
				this.import_decl();
				}
				}
				this.state = 65;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 69;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 66;
					this.field_decl();
					}
					}
				}
				this.state = 71;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
			}
			this.state = 75;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14340) !== 0)) {
				{
				{
				this.state = 72;
				this.method_decl();
				}
				}
				this.state = 77;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 78;
			this.match(DecafParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public import_decl(): Import_declContext {
		let localctx: Import_declContext = new Import_declContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, DecafParser.RULE_import_decl);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 80;
			this.match(DecafParser.IMPORT);
			this.state = 81;
			this.match(DecafParser.ID);
			this.state = 82;
			this.match(DecafParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public field_decl(): Field_declContext {
		let localctx: Field_declContext = new Field_declContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, DecafParser.RULE_field_decl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 84;
			this.type_();
			this.state = 87;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				{
				this.state = 85;
				this.match(DecafParser.ID);
				}
				break;
			case 2:
				{
				this.state = 86;
				this.array_field_decl();
				}
				break;
			}
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===37) {
				{
				{
				this.state = 89;
				this.match(DecafParser.COMMA);
				this.state = 92;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
				case 1:
					{
					this.state = 90;
					this.match(DecafParser.ID);
					}
					break;
				case 2:
					{
					this.state = 91;
					this.array_field_decl();
					}
					break;
				}
				}
				}
				this.state = 98;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 99;
			this.match(DecafParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public array_field_decl(): Array_field_declContext {
		let localctx: Array_field_declContext = new Array_field_declContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, DecafParser.RULE_array_field_decl);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 101;
			this.match(DecafParser.ID);
			this.state = 102;
			this.match(DecafParser.LEFT_BRACKET);
			this.state = 103;
			this.int_literal();
			this.state = 104;
			this.match(DecafParser.RIGHT_BRACKET);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_decl(): Method_declContext {
		let localctx: Method_declContext = new Method_declContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, DecafParser.RULE_method_decl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 108;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 11:
			case 12:
			case 13:
				{
				this.state = 106;
				this.type_();
				}
				break;
			case 2:
				{
				this.state = 107;
				this.match(DecafParser.VOID);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 110;
			this.match(DecafParser.ID);
			this.state = 111;
			this.match(DecafParser.LEFT_PAREN);
			this.state = 123;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0)) {
				{
				this.state = 112;
				this.type_();
				this.state = 113;
				this.match(DecafParser.ID);
				this.state = 120;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===37) {
					{
					{
					this.state = 114;
					this.match(DecafParser.COMMA);
					this.state = 115;
					this.type_();
					this.state = 116;
					this.match(DecafParser.ID);
					}
					}
					this.state = 122;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 125;
			this.match(DecafParser.RIGHT_PAREN);
			this.state = 126;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, DecafParser.RULE_block);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 128;
			this.match(DecafParser.LEFT_BRACE);
			this.state = 132;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0)) {
				{
				{
				this.state = 129;
				this.field_decl();
				}
				}
				this.state = 134;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 138;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 984) !== 0) || _la===45) {
				{
				{
				this.state = 135;
				this.statement();
				}
				}
				this.state = 140;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 141;
			this.match(DecafParser.RIGHT_BRACE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_(): TypeContext {
		let localctx: TypeContext = new TypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, DecafParser.RULE_type);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 143;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, DecafParser.RULE_statement);
		try {
			this.state = 160;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 145;
				this.location();
				this.state = 146;
				this.assign_expr();
				this.state = 147;
				this.match(DecafParser.SEMI);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 149;
				this.method_call();
				this.state = 150;
				this.match(DecafParser.SEMI);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 152;
				this.if_stmt();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 153;
				this.for_stmt();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 154;
				this.while_stmt();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 155;
				this.return_stmt();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 156;
				this.match(DecafParser.BREAK);
				this.state = 157;
				this.match(DecafParser.SEMI);
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 158;
				this.match(DecafParser.CONTINUE);
				this.state = 159;
				this.match(DecafParser.SEMI);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public if_stmt(): If_stmtContext {
		let localctx: If_stmtContext = new If_stmtContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, DecafParser.RULE_if_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 162;
			this.match(DecafParser.IF);
			this.state = 163;
			this.match(DecafParser.LEFT_PAREN);
			this.state = 164;
			this.expr(0);
			this.state = 165;
			this.match(DecafParser.RIGHT_PAREN);
			this.state = 166;
			this.block();
			this.state = 169;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 167;
				this.match(DecafParser.ELSE);
				this.state = 168;
				this.block();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_stmt(): For_stmtContext {
		let localctx: For_stmtContext = new For_stmtContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, DecafParser.RULE_for_stmt);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 171;
			this.match(DecafParser.FOR);
			this.state = 172;
			this.match(DecafParser.LEFT_PAREN);
			this.state = 173;
			this.match(DecafParser.ID);
			this.state = 174;
			this.match(DecafParser.ASSIGN);
			this.state = 175;
			this.expr(0);
			this.state = 176;
			this.match(DecafParser.SEMI);
			this.state = 177;
			this.expr(0);
			this.state = 178;
			this.match(DecafParser.SEMI);
			this.state = 179;
			this.for_update();
			this.state = 180;
			this.match(DecafParser.RIGHT_PAREN);
			this.state = 181;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public while_stmt(): While_stmtContext {
		let localctx: While_stmtContext = new While_stmtContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, DecafParser.RULE_while_stmt);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 183;
			this.match(DecafParser.WHILE);
			this.state = 184;
			this.match(DecafParser.LEFT_PAREN);
			this.state = 185;
			this.expr(0);
			this.state = 186;
			this.match(DecafParser.RIGHT_PAREN);
			this.state = 187;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public return_stmt(): Return_stmtContext {
		let localctx: Return_stmtContext = new Return_stmtContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, DecafParser.RULE_return_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 189;
			this.match(DecafParser.RETURN);
			this.state = 191;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1610685440) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 223) !== 0)) {
				{
				this.state = 190;
				this.expr(0);
				}
			}

			this.state = 193;
			this.match(DecafParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_update(): For_updateContext {
		let localctx: For_updateContext = new For_updateContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, DecafParser.RULE_for_update);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 195;
			this.location();
			this.state = 196;
			this.assign_expr();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assign_expr(): Assign_exprContext {
		let localctx: Assign_exprContext = new Assign_exprContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, DecafParser.RULE_assign_expr);
		try {
			this.state = 202;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 198;
				this.assign_op();
				this.state = 199;
				this.expr(0);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 201;
				this.increment();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assign_op(): Assign_opContext {
		let localctx: Assign_opContext = new Assign_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, DecafParser.RULE_assign_op);
		try {
			this.state = 215;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 204;
				this.match(DecafParser.ASSIGN);
				}
				break;
			case 15:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 205;
				this.match(DecafParser.PLUS);
				this.state = 206;
				this.match(DecafParser.ASSIGN);
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 207;
				this.match(DecafParser.MINUS);
				this.state = 208;
				this.match(DecafParser.ASSIGN);
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 209;
				this.match(DecafParser.MULTIPLY);
				this.state = 210;
				this.match(DecafParser.ASSIGN);
				}
				break;
			case 18:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 211;
				this.match(DecafParser.DIVIDE);
				this.state = 212;
				this.match(DecafParser.ASSIGN);
				}
				break;
			case 19:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 213;
				this.match(DecafParser.MODULO);
				this.state = 214;
				this.match(DecafParser.ASSIGN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public increment(): IncrementContext {
		let localctx: IncrementContext = new IncrementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, DecafParser.RULE_increment);
		try {
			this.state = 219;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 20:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 217;
				this.match(DecafParser.INCREMENT);
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 218;
				this.decrement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public decrement(): DecrementContext {
		let localctx: DecrementContext = new DecrementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, DecafParser.RULE_decrement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 221;
			this.match(DecafParser.MINUS);
			this.state = 222;
			this.match(DecafParser.MINUS);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_call(): Method_callContext {
		let localctx: Method_callContext = new Method_callContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, DecafParser.RULE_method_call);
		let _la: number;
		try {
			this.state = 252;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 224;
				this.method_name();
				this.state = 225;
				this.match(DecafParser.LEFT_PAREN);
				this.state = 234;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1610685440) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 223) !== 0)) {
					{
					this.state = 226;
					this.expr(0);
					this.state = 231;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===37) {
						{
						{
						this.state = 227;
						this.match(DecafParser.COMMA);
						this.state = 228;
						this.expr(0);
						}
						}
						this.state = 233;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 236;
				this.match(DecafParser.RIGHT_PAREN);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 238;
				this.method_name();
				this.state = 239;
				this.match(DecafParser.LEFT_PAREN);
				this.state = 248;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1610685440) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 255) !== 0)) {
					{
					this.state = 240;
					this.extern_arg();
					this.state = 245;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===37) {
						{
						{
						this.state = 241;
						this.match(DecafParser.COMMA);
						this.state = 242;
						this.extern_arg();
						}
						}
						this.state = 247;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 250;
				this.match(DecafParser.RIGHT_PAREN);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_name(): Method_nameContext {
		let localctx: Method_nameContext = new Method_nameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, DecafParser.RULE_method_name);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 254;
			this.match(DecafParser.ID);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public location(): LocationContext {
		let localctx: LocationContext = new LocationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, DecafParser.RULE_location);
		try {
			this.state = 262;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 256;
				this.match(DecafParser.ID);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				{
				this.state = 257;
				this.match(DecafParser.ID);
				this.state = 258;
				this.match(DecafParser.LEFT_BRACKET);
				this.state = 259;
				this.expr(0);
				this.state = 260;
				this.match(DecafParser.RIGHT_BRACKET);
				}
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public expr(): ExprContext;
	public expr(_p: number): ExprContext;
	// @RuleVersion(0)
	public expr(_p?: number): ExprContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: ExprContext = new ExprContext(this, this._ctx, _parentState);
		let _prevctx: ExprContext = localctx;
		let _startState: number = 40;
		this.enterRecursionRule(localctx, 40, DecafParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 285;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 23, this._ctx) ) {
			case 1:
				{
				this.state = 265;
				this.match(DecafParser.LEFT_PAREN);
				this.state = 266;
				this.expr(0);
				this.state = 267;
				this.match(DecafParser.RIGHT_PAREN);
				}
				break;
			case 2:
				{
				this.state = 269;
				this.match(DecafParser.MINUS);
				this.state = 270;
				this.expr(13);
				}
				break;
			case 3:
				{
				this.state = 271;
				this.match(DecafParser.NOT);
				this.state = 272;
				this.expr(12);
				}
				break;
			case 4:
				{
				this.state = 273;
				_la = this._input.LA(1);
				if(!(_la===11 || _la===12)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 274;
				this.match(DecafParser.LEFT_PAREN);
				this.state = 275;
				this.expr(0);
				this.state = 276;
				this.match(DecafParser.RIGHT_PAREN);
				}
				break;
			case 5:
				{
				this.state = 278;
				this.match(DecafParser.LEN);
				this.state = 279;
				this.match(DecafParser.LEFT_PAREN);
				this.state = 280;
				this.match(DecafParser.ID);
				this.state = 281;
				this.match(DecafParser.RIGHT_PAREN);
				}
				break;
			case 6:
				{
				this.state = 282;
				this.location();
				}
				break;
			case 7:
				{
				this.state = 283;
				this.method_call();
				}
				break;
			case 8:
				{
				this.state = 284;
				this.literal();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 307;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 305;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 24, this._ctx) ) {
					case 1:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 287;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 288;
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 917504) !== 0))) {
						this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 289;
						this.expr(10);
						}
						break;
					case 2:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 290;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 291;
						_la = this._input.LA(1);
						if(!(_la===15 || _la===16)) {
						this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 292;
						this.expr(9);
						}
						break;
					case 3:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 293;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 294;
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 125829120) !== 0))) {
						this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 295;
						this.expr(8);
						}
						break;
					case 4:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 296;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 297;
						_la = this._input.LA(1);
						if(!(_la===21 || _la===22)) {
						this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 298;
						this.expr(7);
						}
						break;
					case 5:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 299;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 300;
						this.match(DecafParser.AND);
						this.state = 301;
						this.expr(6);
						}
						break;
					case 6:
						{
						localctx = new ExprContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, DecafParser.RULE_expr);
						this.state = 302;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 303;
						this.match(DecafParser.OR);
						this.state = 304;
						this.expr(5);
						}
						break;
					}
					}
				}
				this.state = 309;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public extern_arg(): Extern_argContext {
		let localctx: Extern_argContext = new Extern_argContext(this, this._ctx, this.state);
		this.enterRule(localctx, 42, DecafParser.RULE_extern_arg);
		try {
			this.state = 312;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 10:
			case 11:
			case 12:
			case 16:
			case 29:
			case 30:
			case 38:
			case 39:
			case 40:
			case 41:
			case 42:
			case 44:
			case 45:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 310;
				this.expr(0);
				}
				break;
			case 43:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 311;
				this.match(DecafParser.STRINGLITERAL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public bin_op(): Bin_opContext {
		let localctx: Bin_opContext = new Bin_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, DecafParser.RULE_bin_op);
		try {
			this.state = 318;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 15:
			case 16:
			case 17:
			case 18:
			case 19:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 314;
				this.arith_op();
				}
				break;
			case 23:
			case 24:
			case 25:
			case 26:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 315;
				this.rel_op();
				}
				break;
			case 21:
			case 22:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 316;
				this.eq_op();
				}
				break;
			case 27:
			case 28:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 317;
				this.cond_op();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public arith_op(): Arith_opContext {
		let localctx: Arith_opContext = new Arith_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, DecafParser.RULE_arith_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 320;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1015808) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rel_op(): Rel_opContext {
		let localctx: Rel_opContext = new Rel_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, DecafParser.RULE_rel_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 322;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 125829120) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public eq_op(): Eq_opContext {
		let localctx: Eq_opContext = new Eq_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, DecafParser.RULE_eq_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 324;
			_la = this._input.LA(1);
			if(!(_la===21 || _la===22)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public cond_op(): Cond_opContext {
		let localctx: Cond_opContext = new Cond_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, DecafParser.RULE_cond_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 326;
			_la = this._input.LA(1);
			if(!(_la===27 || _la===28)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let localctx: LiteralContext = new LiteralContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, DecafParser.RULE_literal);
		let _la: number;
		try {
			this.state = 335;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 16:
			case 40:
			case 41:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 329;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 328;
					this.match(DecafParser.MINUS);
					}
				}

				this.state = 331;
				this.int_literal();
				}
				break;
			case 38:
			case 39:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 332;
				this.long_literal();
				}
				break;
			case 42:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 333;
				this.match(DecafParser.CHARLITERAL);
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 334;
				this.match(DecafParser.BOOLLITERAL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public int_literal(): Int_literalContext {
		let localctx: Int_literalContext = new Int_literalContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, DecafParser.RULE_int_literal);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 337;
			_la = this._input.LA(1);
			if(!(_la===40 || _la===41)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public long_literal(): Long_literalContext {
		let localctx: Long_literalContext = new Long_literalContext(this, this._ctx, this.state);
		this.enterRule(localctx, 58, DecafParser.RULE_long_literal);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 339;
			_la = this._input.LA(1);
			if(!(_la===38 || _la===39)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 20:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		}
		return true;
	}
	private expr_sempred(localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 9);
		case 1:
			return this.precpred(this._ctx, 8);
		case 2:
			return this.precpred(this._ctx, 7);
		case 3:
			return this.precpred(this._ctx, 6);
		case 4:
			return this.precpred(this._ctx, 5);
		case 5:
			return this.precpred(this._ctx, 4);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,48,342,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,1,0,5,0,62,8,0,10,
	0,12,0,65,9,0,1,0,5,0,68,8,0,10,0,12,0,71,9,0,1,0,5,0,74,8,0,10,0,12,0,
	77,9,0,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,3,2,88,8,2,1,2,1,2,1,2,3,2,93,
	8,2,5,2,95,8,2,10,2,12,2,98,9,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,4,1,4,3,4,
	109,8,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,5,4,119,8,4,10,4,12,4,122,9,4,3,
	4,124,8,4,1,4,1,4,1,4,1,5,1,5,5,5,131,8,5,10,5,12,5,134,9,5,1,5,5,5,137,
	8,5,10,5,12,5,140,9,5,1,5,1,5,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,
	7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,161,8,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,170,
	8,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,10,1,10,1,10,1,10,
	1,10,1,10,1,11,1,11,3,11,192,8,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,
	13,1,13,3,13,203,8,13,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,
	1,14,3,14,216,8,14,1,15,1,15,3,15,220,8,15,1,16,1,16,1,16,1,17,1,17,1,17,
	1,17,1,17,5,17,230,8,17,10,17,12,17,233,9,17,3,17,235,8,17,1,17,1,17,1,
	17,1,17,1,17,1,17,1,17,5,17,244,8,17,10,17,12,17,247,9,17,3,17,249,8,17,
	1,17,1,17,3,17,253,8,17,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,19,3,19,263,
	8,19,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,
	20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,286,8,20,1,20,1,20,1,20,1,20,
	1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,5,
	20,306,8,20,10,20,12,20,309,9,20,1,21,1,21,3,21,313,8,21,1,22,1,22,1,22,
	1,22,3,22,319,8,22,1,23,1,23,1,24,1,24,1,25,1,25,1,26,1,26,1,27,3,27,330,
	8,27,1,27,1,27,1,27,1,27,3,27,336,8,27,1,28,1,28,1,29,1,29,1,29,0,1,40,
	30,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
	50,52,54,56,58,0,10,1,0,11,13,1,0,11,12,1,0,17,19,1,0,15,16,1,0,23,26,1,
	0,21,22,1,0,15,19,1,0,27,28,1,0,40,41,1,0,38,39,365,0,63,1,0,0,0,2,80,1,
	0,0,0,4,84,1,0,0,0,6,101,1,0,0,0,8,108,1,0,0,0,10,128,1,0,0,0,12,143,1,
	0,0,0,14,160,1,0,0,0,16,162,1,0,0,0,18,171,1,0,0,0,20,183,1,0,0,0,22,189,
	1,0,0,0,24,195,1,0,0,0,26,202,1,0,0,0,28,215,1,0,0,0,30,219,1,0,0,0,32,
	221,1,0,0,0,34,252,1,0,0,0,36,254,1,0,0,0,38,262,1,0,0,0,40,285,1,0,0,0,
	42,312,1,0,0,0,44,318,1,0,0,0,46,320,1,0,0,0,48,322,1,0,0,0,50,324,1,0,
	0,0,52,326,1,0,0,0,54,335,1,0,0,0,56,337,1,0,0,0,58,339,1,0,0,0,60,62,3,
	2,1,0,61,60,1,0,0,0,62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,64,69,1,0,
	0,0,65,63,1,0,0,0,66,68,3,4,2,0,67,66,1,0,0,0,68,71,1,0,0,0,69,67,1,0,0,
	0,69,70,1,0,0,0,70,75,1,0,0,0,71,69,1,0,0,0,72,74,3,8,4,0,73,72,1,0,0,0,
	74,77,1,0,0,0,75,73,1,0,0,0,75,76,1,0,0,0,76,78,1,0,0,0,77,75,1,0,0,0,78,
	79,5,0,0,1,79,1,1,0,0,0,80,81,5,1,0,0,81,82,5,45,0,0,82,83,5,36,0,0,83,
	3,1,0,0,0,84,87,3,12,6,0,85,88,5,45,0,0,86,88,3,6,3,0,87,85,1,0,0,0,87,
	86,1,0,0,0,88,96,1,0,0,0,89,92,5,37,0,0,90,93,5,45,0,0,91,93,3,6,3,0,92,
	90,1,0,0,0,92,91,1,0,0,0,93,95,1,0,0,0,94,89,1,0,0,0,95,98,1,0,0,0,96,94,
	1,0,0,0,96,97,1,0,0,0,97,99,1,0,0,0,98,96,1,0,0,0,99,100,5,36,0,0,100,5,
	1,0,0,0,101,102,5,45,0,0,102,103,5,34,0,0,103,104,3,56,28,0,104,105,5,35,
	0,0,105,7,1,0,0,0,106,109,3,12,6,0,107,109,5,2,0,0,108,106,1,0,0,0,108,
	107,1,0,0,0,109,110,1,0,0,0,110,111,5,45,0,0,111,123,5,30,0,0,112,113,3,
	12,6,0,113,120,5,45,0,0,114,115,5,37,0,0,115,116,3,12,6,0,116,117,5,45,
	0,0,117,119,1,0,0,0,118,114,1,0,0,0,119,122,1,0,0,0,120,118,1,0,0,0,120,
	121,1,0,0,0,121,124,1,0,0,0,122,120,1,0,0,0,123,112,1,0,0,0,123,124,1,0,
	0,0,124,125,1,0,0,0,125,126,5,31,0,0,126,127,3,10,5,0,127,9,1,0,0,0,128,
	132,5,32,0,0,129,131,3,4,2,0,130,129,1,0,0,0,131,134,1,0,0,0,132,130,1,
	0,0,0,132,133,1,0,0,0,133,138,1,0,0,0,134,132,1,0,0,0,135,137,3,14,7,0,
	136,135,1,0,0,0,137,140,1,0,0,0,138,136,1,0,0,0,138,139,1,0,0,0,139,141,
	1,0,0,0,140,138,1,0,0,0,141,142,5,33,0,0,142,11,1,0,0,0,143,144,7,0,0,0,
	144,13,1,0,0,0,145,146,3,38,19,0,146,147,3,26,13,0,147,148,5,36,0,0,148,
	161,1,0,0,0,149,150,3,34,17,0,150,151,5,36,0,0,151,161,1,0,0,0,152,161,
	3,16,8,0,153,161,3,18,9,0,154,161,3,20,10,0,155,161,3,22,11,0,156,157,5,
	8,0,0,157,161,5,36,0,0,158,159,5,9,0,0,159,161,5,36,0,0,160,145,1,0,0,0,
	160,149,1,0,0,0,160,152,1,0,0,0,160,153,1,0,0,0,160,154,1,0,0,0,160,155,
	1,0,0,0,160,156,1,0,0,0,160,158,1,0,0,0,161,15,1,0,0,0,162,163,5,4,0,0,
	163,164,5,30,0,0,164,165,3,40,20,0,165,166,5,31,0,0,166,169,3,10,5,0,167,
	168,5,5,0,0,168,170,3,10,5,0,169,167,1,0,0,0,169,170,1,0,0,0,170,17,1,0,
	0,0,171,172,5,6,0,0,172,173,5,30,0,0,173,174,5,45,0,0,174,175,5,14,0,0,
	175,176,3,40,20,0,176,177,5,36,0,0,177,178,3,40,20,0,178,179,5,36,0,0,179,
	180,3,24,12,0,180,181,5,31,0,0,181,182,3,10,5,0,182,19,1,0,0,0,183,184,
	5,7,0,0,184,185,5,30,0,0,185,186,3,40,20,0,186,187,5,31,0,0,187,188,3,10,
	5,0,188,21,1,0,0,0,189,191,5,3,0,0,190,192,3,40,20,0,191,190,1,0,0,0,191,
	192,1,0,0,0,192,193,1,0,0,0,193,194,5,36,0,0,194,23,1,0,0,0,195,196,3,38,
	19,0,196,197,3,26,13,0,197,25,1,0,0,0,198,199,3,28,14,0,199,200,3,40,20,
	0,200,203,1,0,0,0,201,203,3,30,15,0,202,198,1,0,0,0,202,201,1,0,0,0,203,
	27,1,0,0,0,204,216,5,14,0,0,205,206,5,15,0,0,206,216,5,14,0,0,207,208,5,
	16,0,0,208,216,5,14,0,0,209,210,5,17,0,0,210,216,5,14,0,0,211,212,5,18,
	0,0,212,216,5,14,0,0,213,214,5,19,0,0,214,216,5,14,0,0,215,204,1,0,0,0,
	215,205,1,0,0,0,215,207,1,0,0,0,215,209,1,0,0,0,215,211,1,0,0,0,215,213,
	1,0,0,0,216,29,1,0,0,0,217,220,5,20,0,0,218,220,3,32,16,0,219,217,1,0,0,
	0,219,218,1,0,0,0,220,31,1,0,0,0,221,222,5,16,0,0,222,223,5,16,0,0,223,
	33,1,0,0,0,224,225,3,36,18,0,225,234,5,30,0,0,226,231,3,40,20,0,227,228,
	5,37,0,0,228,230,3,40,20,0,229,227,1,0,0,0,230,233,1,0,0,0,231,229,1,0,
	0,0,231,232,1,0,0,0,232,235,1,0,0,0,233,231,1,0,0,0,234,226,1,0,0,0,234,
	235,1,0,0,0,235,236,1,0,0,0,236,237,5,31,0,0,237,253,1,0,0,0,238,239,3,
	36,18,0,239,248,5,30,0,0,240,245,3,42,21,0,241,242,5,37,0,0,242,244,3,42,
	21,0,243,241,1,0,0,0,244,247,1,0,0,0,245,243,1,0,0,0,245,246,1,0,0,0,246,
	249,1,0,0,0,247,245,1,0,0,0,248,240,1,0,0,0,248,249,1,0,0,0,249,250,1,0,
	0,0,250,251,5,31,0,0,251,253,1,0,0,0,252,224,1,0,0,0,252,238,1,0,0,0,253,
	35,1,0,0,0,254,255,5,45,0,0,255,37,1,0,0,0,256,263,5,45,0,0,257,258,5,45,
	0,0,258,259,5,34,0,0,259,260,3,40,20,0,260,261,5,35,0,0,261,263,1,0,0,0,
	262,256,1,0,0,0,262,257,1,0,0,0,263,39,1,0,0,0,264,265,6,20,-1,0,265,266,
	5,30,0,0,266,267,3,40,20,0,267,268,5,31,0,0,268,286,1,0,0,0,269,270,5,16,
	0,0,270,286,3,40,20,13,271,272,5,29,0,0,272,286,3,40,20,12,273,274,7,1,
	0,0,274,275,5,30,0,0,275,276,3,40,20,0,276,277,5,31,0,0,277,286,1,0,0,0,
	278,279,5,10,0,0,279,280,5,30,0,0,280,281,5,45,0,0,281,286,5,31,0,0,282,
	286,3,38,19,0,283,286,3,34,17,0,284,286,3,54,27,0,285,264,1,0,0,0,285,269,
	1,0,0,0,285,271,1,0,0,0,285,273,1,0,0,0,285,278,1,0,0,0,285,282,1,0,0,0,
	285,283,1,0,0,0,285,284,1,0,0,0,286,307,1,0,0,0,287,288,10,9,0,0,288,289,
	7,2,0,0,289,306,3,40,20,10,290,291,10,8,0,0,291,292,7,3,0,0,292,306,3,40,
	20,9,293,294,10,7,0,0,294,295,7,4,0,0,295,306,3,40,20,8,296,297,10,6,0,
	0,297,298,7,5,0,0,298,306,3,40,20,7,299,300,10,5,0,0,300,301,5,27,0,0,301,
	306,3,40,20,6,302,303,10,4,0,0,303,304,5,28,0,0,304,306,3,40,20,5,305,287,
	1,0,0,0,305,290,1,0,0,0,305,293,1,0,0,0,305,296,1,0,0,0,305,299,1,0,0,0,
	305,302,1,0,0,0,306,309,1,0,0,0,307,305,1,0,0,0,307,308,1,0,0,0,308,41,
	1,0,0,0,309,307,1,0,0,0,310,313,3,40,20,0,311,313,5,43,0,0,312,310,1,0,
	0,0,312,311,1,0,0,0,313,43,1,0,0,0,314,319,3,46,23,0,315,319,3,48,24,0,
	316,319,3,50,25,0,317,319,3,52,26,0,318,314,1,0,0,0,318,315,1,0,0,0,318,
	316,1,0,0,0,318,317,1,0,0,0,319,45,1,0,0,0,320,321,7,6,0,0,321,47,1,0,0,
	0,322,323,7,4,0,0,323,49,1,0,0,0,324,325,7,5,0,0,325,51,1,0,0,0,326,327,
	7,7,0,0,327,53,1,0,0,0,328,330,5,16,0,0,329,328,1,0,0,0,329,330,1,0,0,0,
	330,331,1,0,0,0,331,336,3,56,28,0,332,336,3,58,29,0,333,336,5,42,0,0,334,
	336,5,44,0,0,335,329,1,0,0,0,335,332,1,0,0,0,335,333,1,0,0,0,335,334,1,
	0,0,0,336,55,1,0,0,0,337,338,7,8,0,0,338,57,1,0,0,0,339,340,7,9,0,0,340,
	59,1,0,0,0,30,63,69,75,87,92,96,108,120,123,132,138,160,169,191,202,215,
	219,231,234,245,248,252,262,285,305,307,312,318,329,335];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!DecafParser.__ATN) {
			DecafParser.__ATN = new ATNDeserializer().deserialize(DecafParser._serializedATN);
		}

		return DecafParser.__ATN;
	}


	static DecisionsToDFA = DecafParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ProgramContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(DecafParser.EOF, 0);
	}
	public import_decl_list(): Import_declContext[] {
		return this.getTypedRuleContexts(Import_declContext) as Import_declContext[];
	}
	public import_decl(i: number): Import_declContext {
		return this.getTypedRuleContext(Import_declContext, i) as Import_declContext;
	}
	public field_decl_list(): Field_declContext[] {
		return this.getTypedRuleContexts(Field_declContext) as Field_declContext[];
	}
	public field_decl(i: number): Field_declContext {
		return this.getTypedRuleContext(Field_declContext, i) as Field_declContext;
	}
	public method_decl_list(): Method_declContext[] {
		return this.getTypedRuleContexts(Method_declContext) as Method_declContext[];
	}
	public method_decl(i: number): Method_declContext {
		return this.getTypedRuleContext(Method_declContext, i) as Method_declContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_program;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterProgram) {
	 		listener.enterProgram(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitProgram) {
	 		listener.exitProgram(this);
		}
	}
}


export class Import_declContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IMPORT(): TerminalNode {
		return this.getToken(DecafParser.IMPORT, 0);
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
	public SEMI(): TerminalNode {
		return this.getToken(DecafParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_import_decl;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterImport_decl) {
	 		listener.enterImport_decl(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitImport_decl) {
	 		listener.exitImport_decl(this);
		}
	}
}


export class Field_declContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(DecafParser.SEMI, 0);
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(DecafParser.ID, i);
	}
	public array_field_decl_list(): Array_field_declContext[] {
		return this.getTypedRuleContexts(Array_field_declContext) as Array_field_declContext[];
	}
	public array_field_decl(i: number): Array_field_declContext {
		return this.getTypedRuleContext(Array_field_declContext, i) as Array_field_declContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(DecafParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_field_decl;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterField_decl) {
	 		listener.enterField_decl(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitField_decl) {
	 		listener.exitField_decl(this);
		}
	}
}


export class Array_field_declContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
	public LEFT_BRACKET(): TerminalNode {
		return this.getToken(DecafParser.LEFT_BRACKET, 0);
	}
	public int_literal(): Int_literalContext {
		return this.getTypedRuleContext(Int_literalContext, 0) as Int_literalContext;
	}
	public RIGHT_BRACKET(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_BRACKET, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_array_field_decl;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterArray_field_decl) {
	 		listener.enterArray_field_decl(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitArray_field_decl) {
	 		listener.exitArray_field_decl(this);
		}
	}
}


export class Method_declContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(DecafParser.ID, i);
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
	public VOID(): TerminalNode {
		return this.getToken(DecafParser.VOID, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(DecafParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_method_decl;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterMethod_decl) {
	 		listener.enterMethod_decl(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitMethod_decl) {
	 		listener.exitMethod_decl(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LEFT_BRACE(): TerminalNode {
		return this.getToken(DecafParser.LEFT_BRACE, 0);
	}
	public RIGHT_BRACE(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_BRACE, 0);
	}
	public field_decl_list(): Field_declContext[] {
		return this.getTypedRuleContexts(Field_declContext) as Field_declContext[];
	}
	public field_decl(i: number): Field_declContext {
		return this.getTypedRuleContext(Field_declContext, i) as Field_declContext;
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_block;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterBlock) {
	 		listener.enterBlock(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitBlock) {
	 		listener.exitBlock(this);
		}
	}
}


export class TypeContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public INT(): TerminalNode {
		return this.getToken(DecafParser.INT, 0);
	}
	public LONG(): TerminalNode {
		return this.getToken(DecafParser.LONG, 0);
	}
	public BOOL(): TerminalNode {
		return this.getToken(DecafParser.BOOL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_type;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterType) {
	 		listener.enterType(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitType) {
	 		listener.exitType(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public location(): LocationContext {
		return this.getTypedRuleContext(LocationContext, 0) as LocationContext;
	}
	public assign_expr(): Assign_exprContext {
		return this.getTypedRuleContext(Assign_exprContext, 0) as Assign_exprContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(DecafParser.SEMI, 0);
	}
	public method_call(): Method_callContext {
		return this.getTypedRuleContext(Method_callContext, 0) as Method_callContext;
	}
	public if_stmt(): If_stmtContext {
		return this.getTypedRuleContext(If_stmtContext, 0) as If_stmtContext;
	}
	public for_stmt(): For_stmtContext {
		return this.getTypedRuleContext(For_stmtContext, 0) as For_stmtContext;
	}
	public while_stmt(): While_stmtContext {
		return this.getTypedRuleContext(While_stmtContext, 0) as While_stmtContext;
	}
	public return_stmt(): Return_stmtContext {
		return this.getTypedRuleContext(Return_stmtContext, 0) as Return_stmtContext;
	}
	public BREAK(): TerminalNode {
		return this.getToken(DecafParser.BREAK, 0);
	}
	public CONTINUE(): TerminalNode {
		return this.getToken(DecafParser.CONTINUE, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_statement;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterStatement) {
	 		listener.enterStatement(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitStatement) {
	 		listener.exitStatement(this);
		}
	}
}


export class If_stmtContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IF(): TerminalNode {
		return this.getToken(DecafParser.IF, 0);
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public block_list(): BlockContext[] {
		return this.getTypedRuleContexts(BlockContext) as BlockContext[];
	}
	public block(i: number): BlockContext {
		return this.getTypedRuleContext(BlockContext, i) as BlockContext;
	}
	public ELSE(): TerminalNode {
		return this.getToken(DecafParser.ELSE, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_if_stmt;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterIf_stmt) {
	 		listener.enterIf_stmt(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitIf_stmt) {
	 		listener.exitIf_stmt(this);
		}
	}
}


export class For_stmtContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FOR(): TerminalNode {
		return this.getToken(DecafParser.FOR, 0);
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
	public ASSIGN(): TerminalNode {
		return this.getToken(DecafParser.ASSIGN, 0);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(DecafParser.SEMI, i);
	}
	public for_update(): For_updateContext {
		return this.getTypedRuleContext(For_updateContext, 0) as For_updateContext;
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_for_stmt;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterFor_stmt) {
	 		listener.enterFor_stmt(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitFor_stmt) {
	 		listener.exitFor_stmt(this);
		}
	}
}


export class While_stmtContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public WHILE(): TerminalNode {
		return this.getToken(DecafParser.WHILE, 0);
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_while_stmt;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterWhile_stmt) {
	 		listener.enterWhile_stmt(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitWhile_stmt) {
	 		listener.exitWhile_stmt(this);
		}
	}
}


export class Return_stmtContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RETURN(): TerminalNode {
		return this.getToken(DecafParser.RETURN, 0);
	}
	public SEMI(): TerminalNode {
		return this.getToken(DecafParser.SEMI, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_return_stmt;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterReturn_stmt) {
	 		listener.enterReturn_stmt(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitReturn_stmt) {
	 		listener.exitReturn_stmt(this);
		}
	}
}


export class For_updateContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public location(): LocationContext {
		return this.getTypedRuleContext(LocationContext, 0) as LocationContext;
	}
	public assign_expr(): Assign_exprContext {
		return this.getTypedRuleContext(Assign_exprContext, 0) as Assign_exprContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_for_update;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterFor_update) {
	 		listener.enterFor_update(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitFor_update) {
	 		listener.exitFor_update(this);
		}
	}
}


export class Assign_exprContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public assign_op(): Assign_opContext {
		return this.getTypedRuleContext(Assign_opContext, 0) as Assign_opContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public increment(): IncrementContext {
		return this.getTypedRuleContext(IncrementContext, 0) as IncrementContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_assign_expr;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterAssign_expr) {
	 		listener.enterAssign_expr(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitAssign_expr) {
	 		listener.exitAssign_expr(this);
		}
	}
}


export class Assign_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ASSIGN(): TerminalNode {
		return this.getToken(DecafParser.ASSIGN, 0);
	}
	public PLUS(): TerminalNode {
		return this.getToken(DecafParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(DecafParser.MINUS, 0);
	}
	public MULTIPLY(): TerminalNode {
		return this.getToken(DecafParser.MULTIPLY, 0);
	}
	public DIVIDE(): TerminalNode {
		return this.getToken(DecafParser.DIVIDE, 0);
	}
	public MODULO(): TerminalNode {
		return this.getToken(DecafParser.MODULO, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_assign_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterAssign_op) {
	 		listener.enterAssign_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitAssign_op) {
	 		listener.exitAssign_op(this);
		}
	}
}


export class IncrementContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public INCREMENT(): TerminalNode {
		return this.getToken(DecafParser.INCREMENT, 0);
	}
	public decrement(): DecrementContext {
		return this.getTypedRuleContext(DecrementContext, 0) as DecrementContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_increment;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterIncrement) {
	 		listener.enterIncrement(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitIncrement) {
	 		listener.exitIncrement(this);
		}
	}
}


export class DecrementContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public MINUS_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.MINUS);
	}
	public MINUS(i: number): TerminalNode {
		return this.getToken(DecafParser.MINUS, i);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_decrement;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterDecrement) {
	 		listener.enterDecrement(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitDecrement) {
	 		listener.exitDecrement(this);
		}
	}
}


export class Method_callContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public method_name(): Method_nameContext {
		return this.getTypedRuleContext(Method_nameContext, 0) as Method_nameContext;
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(DecafParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(DecafParser.COMMA, i);
	}
	public extern_arg_list(): Extern_argContext[] {
		return this.getTypedRuleContexts(Extern_argContext) as Extern_argContext[];
	}
	public extern_arg(i: number): Extern_argContext {
		return this.getTypedRuleContext(Extern_argContext, i) as Extern_argContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_method_call;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterMethod_call) {
	 		listener.enterMethod_call(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitMethod_call) {
	 		listener.exitMethod_call(this);
		}
	}
}


export class Method_nameContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_method_name;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterMethod_name) {
	 		listener.enterMethod_name(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitMethod_name) {
	 		listener.exitMethod_name(this);
		}
	}
}


export class LocationContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
	public LEFT_BRACKET(): TerminalNode {
		return this.getToken(DecafParser.LEFT_BRACKET, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public RIGHT_BRACKET(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_BRACKET, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_location;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterLocation) {
	 		listener.enterLocation(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitLocation) {
	 		listener.exitLocation(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LEFT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.LEFT_PAREN, 0);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public RIGHT_PAREN(): TerminalNode {
		return this.getToken(DecafParser.RIGHT_PAREN, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(DecafParser.MINUS, 0);
	}
	public NOT(): TerminalNode {
		return this.getToken(DecafParser.NOT, 0);
	}
	public INT(): TerminalNode {
		return this.getToken(DecafParser.INT, 0);
	}
	public LONG(): TerminalNode {
		return this.getToken(DecafParser.LONG, 0);
	}
	public LEN(): TerminalNode {
		return this.getToken(DecafParser.LEN, 0);
	}
	public ID(): TerminalNode {
		return this.getToken(DecafParser.ID, 0);
	}
	public location(): LocationContext {
		return this.getTypedRuleContext(LocationContext, 0) as LocationContext;
	}
	public method_call(): Method_callContext {
		return this.getTypedRuleContext(Method_callContext, 0) as Method_callContext;
	}
	public literal(): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
	}
	public MULTIPLY(): TerminalNode {
		return this.getToken(DecafParser.MULTIPLY, 0);
	}
	public DIVIDE(): TerminalNode {
		return this.getToken(DecafParser.DIVIDE, 0);
	}
	public MODULO(): TerminalNode {
		return this.getToken(DecafParser.MODULO, 0);
	}
	public PLUS(): TerminalNode {
		return this.getToken(DecafParser.PLUS, 0);
	}
	public LESS_THAN(): TerminalNode {
		return this.getToken(DecafParser.LESS_THAN, 0);
	}
	public GREATER_THAN(): TerminalNode {
		return this.getToken(DecafParser.GREATER_THAN, 0);
	}
	public LESS_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.LESS_EQUAL, 0);
	}
	public GREATER_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.GREATER_EQUAL, 0);
	}
	public EQUAL(): TerminalNode {
		return this.getToken(DecafParser.EQUAL, 0);
	}
	public NOT_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.NOT_EQUAL, 0);
	}
	public AND(): TerminalNode {
		return this.getToken(DecafParser.AND, 0);
	}
	public OR(): TerminalNode {
		return this.getToken(DecafParser.OR, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_expr;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterExpr) {
	 		listener.enterExpr(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitExpr) {
	 		listener.exitExpr(this);
		}
	}
}


export class Extern_argContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public STRINGLITERAL(): TerminalNode {
		return this.getToken(DecafParser.STRINGLITERAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_extern_arg;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterExtern_arg) {
	 		listener.enterExtern_arg(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitExtern_arg) {
	 		listener.exitExtern_arg(this);
		}
	}
}


export class Bin_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public arith_op(): Arith_opContext {
		return this.getTypedRuleContext(Arith_opContext, 0) as Arith_opContext;
	}
	public rel_op(): Rel_opContext {
		return this.getTypedRuleContext(Rel_opContext, 0) as Rel_opContext;
	}
	public eq_op(): Eq_opContext {
		return this.getTypedRuleContext(Eq_opContext, 0) as Eq_opContext;
	}
	public cond_op(): Cond_opContext {
		return this.getTypedRuleContext(Cond_opContext, 0) as Cond_opContext;
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_bin_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterBin_op) {
	 		listener.enterBin_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitBin_op) {
	 		listener.exitBin_op(this);
		}
	}
}


export class Arith_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PLUS(): TerminalNode {
		return this.getToken(DecafParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(DecafParser.MINUS, 0);
	}
	public MULTIPLY(): TerminalNode {
		return this.getToken(DecafParser.MULTIPLY, 0);
	}
	public DIVIDE(): TerminalNode {
		return this.getToken(DecafParser.DIVIDE, 0);
	}
	public MODULO(): TerminalNode {
		return this.getToken(DecafParser.MODULO, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_arith_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterArith_op) {
	 		listener.enterArith_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitArith_op) {
	 		listener.exitArith_op(this);
		}
	}
}


export class Rel_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LESS_THAN(): TerminalNode {
		return this.getToken(DecafParser.LESS_THAN, 0);
	}
	public GREATER_THAN(): TerminalNode {
		return this.getToken(DecafParser.GREATER_THAN, 0);
	}
	public LESS_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.LESS_EQUAL, 0);
	}
	public GREATER_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.GREATER_EQUAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_rel_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterRel_op) {
	 		listener.enterRel_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitRel_op) {
	 		listener.exitRel_op(this);
		}
	}
}


export class Eq_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(DecafParser.EQUAL, 0);
	}
	public NOT_EQUAL(): TerminalNode {
		return this.getToken(DecafParser.NOT_EQUAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_eq_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterEq_op) {
	 		listener.enterEq_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitEq_op) {
	 		listener.exitEq_op(this);
		}
	}
}


export class Cond_opContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public AND(): TerminalNode {
		return this.getToken(DecafParser.AND, 0);
	}
	public OR(): TerminalNode {
		return this.getToken(DecafParser.OR, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_cond_op;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterCond_op) {
	 		listener.enterCond_op(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitCond_op) {
	 		listener.exitCond_op(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public int_literal(): Int_literalContext {
		return this.getTypedRuleContext(Int_literalContext, 0) as Int_literalContext;
	}
	public MINUS(): TerminalNode {
		return this.getToken(DecafParser.MINUS, 0);
	}
	public long_literal(): Long_literalContext {
		return this.getTypedRuleContext(Long_literalContext, 0) as Long_literalContext;
	}
	public CHARLITERAL(): TerminalNode {
		return this.getToken(DecafParser.CHARLITERAL, 0);
	}
	public BOOLLITERAL(): TerminalNode {
		return this.getToken(DecafParser.BOOLLITERAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_literal;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterLiteral) {
	 		listener.enterLiteral(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitLiteral) {
	 		listener.exitLiteral(this);
		}
	}
}


export class Int_literalContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DECIMALLITERAL(): TerminalNode {
		return this.getToken(DecafParser.DECIMALLITERAL, 0);
	}
	public HEXLITERAL(): TerminalNode {
		return this.getToken(DecafParser.HEXLITERAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_int_literal;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterInt_literal) {
	 		listener.enterInt_literal(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitInt_literal) {
	 		listener.exitInt_literal(this);
		}
	}
}


export class Long_literalContext extends ParserRuleContext {
	constructor(parser?: DecafParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LONGDECLITERAL(): TerminalNode {
		return this.getToken(DecafParser.LONGDECLITERAL, 0);
	}
	public LONGHEXLITERAL(): TerminalNode {
		return this.getToken(DecafParser.LONGHEXLITERAL, 0);
	}
    public get ruleIndex(): number {
    	return DecafParser.RULE_long_literal;
	}
	public enterRule(listener: DecafParserListener): void {
	    if(listener.enterLong_literal) {
	 		listener.enterLong_literal(this);
		}
	}
	public exitRule(listener: DecafParserListener): void {
	    if(listener.exitLong_literal) {
	 		listener.exitLong_literal(this);
		}
	}
}
