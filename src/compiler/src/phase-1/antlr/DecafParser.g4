parser grammar DecafParser;

options { tokenVocab=DecafLexer; }

// Program Structure
program: import_decl* field_decl* method_decl* EOF;

import_decl: IMPORT ID SEMI;

// Updated field_decl: Now follows correct `x+,` notation (no trailing comma)
field_decl: type (ID | array_field_decl) (COMMA (ID | array_field_decl))* SEMI;
array_field_decl: ID LEFT_BRACKET int_literal RIGHT_BRACKET;

method_decl: (type | VOID) ID LEFT_PAREN (type ID (COMMA type ID)*)? RIGHT_PAREN block;

block: LEFT_BRACE field_decl* statement* RIGHT_BRACE;

type: INT | LONG | BOOL;

// Statements
statement: 
      location assign_expr SEMI
    | method_call SEMI
    | if_stmt
    | for_stmt
    | while_stmt
    | return_stmt
    | BREAK SEMI
    | CONTINUE SEMI;

if_stmt: IF LEFT_PAREN expr RIGHT_PAREN block (ELSE block)?;

for_stmt: FOR LEFT_PAREN ID ASSIGN expr SEMI expr SEMI for_update RIGHT_PAREN block;

while_stmt: WHILE LEFT_PAREN expr RIGHT_PAREN block;

return_stmt: RETURN expr? SEMI;

for_update: location assign_expr;

// Assignments & Expressions
assign_expr: assign_op expr | increment;
assign_op: ASSIGN | PLUS ASSIGN | MINUS ASSIGN | MULTIPLY ASSIGN | DIVIDE ASSIGN | MODULO ASSIGN;
increment: INCREMENT | decrement;

decrement : MINUS MINUS;

// Method Calls
method_call: method_name LEFT_PAREN (expr (COMMA expr)*)? RIGHT_PAREN
           | method_name LEFT_PAREN (extern_arg (COMMA extern_arg)*)? RIGHT_PAREN;

method_name: ID;

// Locations
location: ID | (ID LEFT_BRACKET expr RIGHT_BRACKET);

//Expressions
expr
    : LEFT_PAREN expr RIGHT_PAREN
    | MINUS expr
    | NOT expr
    | (INT | LONG) LEFT_PAREN expr RIGHT_PAREN
    | LEN LEFT_PAREN ID RIGHT_PAREN
    | expr (MULTIPLY | DIVIDE | MODULO) expr
    | expr (PLUS | MINUS) expr
    | expr (LESS_THAN | GREATER_THAN | LESS_EQUAL | GREATER_EQUAL) expr
    | expr (EQUAL | NOT_EQUAL) expr
    | expr AND expr
    | expr OR expr
    | location
    | method_call
    | literal
    ;

// // Expressions
// expr: 
//       location
//     | method_call
//     | literal
//     | LONG LEFT_PAREN expr RIGHT_PAREN
//     | INT LEFT_PAREN expr RIGHT_PAREN
//     | LEN LEFT_PAREN ID RIGHT_PAREN
//     | expr bin_op expr
//     | MINUS expr
//     | NOT expr
//     | LEFT_PAREN expr RIGHT_PAREN;

extern_arg: expr | STRINGLITERAL;

// Operators
bin_op: arith_op | rel_op | eq_op | cond_op;
arith_op: PLUS | MINUS | MULTIPLY | DIVIDE | MODULO;
rel_op: LESS_THAN | GREATER_THAN | LESS_EQUAL | GREATER_EQUAL;
eq_op: EQUAL | NOT_EQUAL;
cond_op: AND | OR;

// Literals
literal: (MINUS)? int_literal | long_literal | CHARLITERAL | BOOLLITERAL;
int_literal: DECIMALLITERAL | HEXLITERAL;
long_literal: LONGDECLITERAL | LONGHEXLITERAL;