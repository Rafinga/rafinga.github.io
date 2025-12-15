lexer grammar DecafLexer;

// Keywords
IMPORT: 'import';
VOID: 'void';
RETURN: 'return';
IF: 'if';
ELSE: 'else';
FOR: 'for';
WHILE: 'while';
BREAK: 'break';
CONTINUE: 'continue';
LEN: 'len';

// Types
INT: 'int';
LONG: 'long';
BOOL: 'bool';


// Operators
ASSIGN: '=';
PLUS: '+';
MINUS: '-';
MULTIPLY: '*';
DIVIDE: '/';
MODULO: '%';
INCREMENT: '++';

// Comparison & Logical Operators
EQUAL: '==';
NOT_EQUAL: '!=';
LESS_THAN: '<';
GREATER_THAN: '>';
LESS_EQUAL: '<=';
GREATER_EQUAL: '>=';
AND: '&&';
OR: '||';
NOT: '!';

// Punctuation
LEFT_PAREN: '(';
RIGHT_PAREN: ')';
LEFT_BRACE: '{';
RIGHT_BRACE: '}';
LEFT_BRACKET: '[';
RIGHT_BRACKET: ']';
SEMI: ';';
COMMA: ',';

// Literals
LONGHEXLITERAL: '0x' [0-9a-fA-F]+ 'L';
LONGDECLITERAL: [0-9]+ 'L';
DECIMALLITERAL: [0-9]+;
HEXLITERAL: '0x' [0-9a-fA-F]+; // Fixed to correctly match hexadecimal numbers
CHARLITERAL: '\'' ( ~['\\] | ESCAPE_SEQUENCE ) '\'';

fragment ESCAPE_SEQUENCE: '\\' ["'\\tnrf];

STRINGLITERAL: '"'( ~["\\] | ESCAPE_SEQUENCE )*'"';
BOOLLITERAL: 'true' | 'false';

// Identifiers
ID: [a-zA-Z_][a-zA-Z0-9_]*;

// Whitespace & Comments
WS: [ \t\r\n]+ -> skip;
LINE_COMMENT: '//' ~[\r\n]* -> skip;
BLOCK_COMMENT: '/*' .*? '*/' -> skip;