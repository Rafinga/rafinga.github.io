enum TokenType {
  STRINGLITERAL = "STRINGLITERAL",
  CHARLITERAL = "CHARLITERAL",
  BOOLEANLITERAL = "BOOLEANLITERAL",
  IDENTIFIER = "IDENTIFIER",
  LONGLITERAL = "LONGLITERAL",
  INTLITERAL = "INTLITERAL",
}

// keywords in Decaf
const KEYWORDS = new Set([
  "import",
  "void",
  "int",
  "long",
  "bool",
  "if",
  "else",
  "for",
  "while",
  "return",
  "break",
  "continue",
  "len",
  "true",
  "false",
]);

const TOKEN_PATTERNS = [
  {
    type: TokenType.STRINGLITERAL,
    regex: /^"(?:[ -!#-\[\]-~]|\\["'\\tnrf])*"/,
  },
  { type: TokenType.CHARLITERAL, regex: /^'(?:[ -!#-\[\]-~]|\\["'\\tnrf])'/ },
  { type: TokenType.BOOLEANLITERAL, regex: /^\b(true|false)\b/ },
  { type: TokenType.IDENTIFIER, regex: /^\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
  { type: TokenType.LONGLITERAL, regex: /^(0x[0-9a-fA-F]+L|\d+L)/ },
  { type: TokenType.INTLITERAL, regex: /^(0x[0-9a-fA-F]+|\d+)/ },
  // multi char operators first
  {
    type: "MULTIOP",
    regex: /^(==|!=|<=|>=|\|\||&&|\+=|-=|\*=|\/=|%=|\+\+|--)/,
  },
  // single char operators
  { type: "SINGLEOP", regex: /^[;,+\*%/<>=\-!]/ },
];

// export function scanFile(filePath: string): {
//   output: string;
//   hasError: boolean;
// } {
//   if (!fs.existsSync(filePath)) {
//     throw new Error(`Error: File not found: ${filePath}`);
//   }
//   const sourceCode = fs.readFileSync(filePath, "utf-8");
//   return tokenize(sourceCode, filePath);
// }

export function tokenize(
  source: string,
  filePath: string
): { output: string; hasError: boolean } {
  const lines = source.split("\n");
  let lineNumber = 0;
  let output: string[] = [];
  let hasError = false;
  let fullStack: string[] = [];
  let blockComment = false;

  for (let line of lines) {
    lineNumber++;

    if (blockComment) {
      if (line.includes("*/")) {
        line = line.substring(line.indexOf("*/") + 2);
        blockComment = false;
      } else {
        continue; //skip lines in block comments
      }
    }

    while (line.includes("/*")) {
      if (line.includes("*/")) {
        line = line.replace(/\/\*[\s\S]*?\*\//g, "");
      } else {
        blockComment = true;
        line = line.substring(0, line.indexOf("/*"));
        break;
      }
    }

    line = line.replace(/\/\/.*/, "");

    if (line.trim() === "") {
      continue;
    }

    const tokenizedLineOutput = tokenizeLine(
      line,
      lineNumber,
      fullStack,
      hasError
    );
    output = output.concat(tokenizedLineOutput.lineOutput);
    hasError = hasError || tokenizedLineOutput.hasError;
    fullStack = tokenizedLineOutput.stack;
  }

  if (fullStack.length !== 0) {
    hasError = true;
  }
  let usedOutput = output.join("\n") + "\n";
  if (usedOutput == "\n") {
    usedOutput = "";
  }

  return hasError
    ? { output: usedOutput, hasError: true }
    : { output: usedOutput, hasError: false };
}

function tokenizeLine(
  line: string,
  lineNumber: number,
  stack: string[],
  hasError: boolean
): { lineOutput: string[]; hasError: boolean; stack: string[] } {
  let output: string[] = [];
  let column = 1;

  while (line.length > 0) {
    line = line.trimStart();

    let match: RegExpExecArray | null = null;
    let tokenType: TokenType | string | null = null;

    // opening symbols { ( [
    if (line.startsWith("{") || line.startsWith("(") || line.startsWith("[")) {
      stack.push(line[0]);
      output.push(`${lineNumber} ${line[0]}`);
      line = line.slice(1);
      continue;
    }

    // closing symbols } ) ]
    if (line.startsWith("}") || line.startsWith(")") || line.startsWith("]")) {
      if (stack.length > 0) {
        let expected = stack.pop();
        if (
          (expected === "{" && line[0] === "}") ||
          (expected === "(" && line[0] === ")") ||
          (expected === "[" && line[0] === "]")
        ) {
          output.push(`${lineNumber} ${line[0]}`);
          line = line.slice(1);
          continue;
        }
      } else {
        hasError = true;
        output.push(`line ${lineNumber}:${column}: unexpected closing`);
        line = line.slice(1);
        continue;
      }
      continue;
    }

    // match token types with regex
    for (const { type, regex } of TOKEN_PATTERNS) {
      match = regex.exec(line);
      if (match) {
        tokenType = type;
        break;
      }
    }

    // unexpected characters
    if (!match) {
      output.push(
        `line ${lineNumber}:${column}: unexpected char: ${line[0]
          .charCodeAt(0)
          .toString(16)}`
      );
      hasError = true;
      line = line.slice(1);
      column++;
      continue;
    }

    const tokenText = match[0];

    // identifier and keywords intersection
    if (tokenType === TokenType.IDENTIFIER) {
      if (KEYWORDS.has(tokenText)) {
        output.push(`${lineNumber} ${tokenText}`);
      } else {
        output.push(`${lineNumber} ${TokenType.IDENTIFIER} ${tokenText}`);
      }
    } else if (tokenType === TokenType.CHARLITERAL) {
      const tokenText = match[0];
      const charContent = tokenText.slice(1, -1);

      // check for unescaped ' or "
      if (charContent === "'" || charContent === '"') {
        hasError = true;
        output.push(
          `line ${lineNumber}:${column}: unexpected char: '${charContent}'`
        );
      } else {
        output.push(`${lineNumber} CHARLITERAL ${tokenText}`);
      }
    } else if (tokenType === TokenType.STRINGLITERAL) {
      const tokenText = match[0];
      const stringContent = tokenText.slice(1, -1);

      // check for unescaped ' or "
      if (stringContent.includes("'") || stringContent.includes('"')) {
        let hasUnescapedQuote = false;
        for (let i = 0; i < stringContent.length; i++) {
          if (
            (stringContent[i] === "'" || stringContent[i] === '"') &&
            (i === 0 || stringContent[i - 1] !== "\\")
          ) {
            hasUnescapedQuote = true;
            output.push(
              `line ${lineNumber}:${column + i + 1}: unescaped symbol: '${
                stringContent[i]
              }'`
            );
          }
        }

        if (hasUnescapedQuote) {
          hasError = true;
        }
      }
      output.push(`${lineNumber} STRINGLITERAL ${tokenText}`);
    }

    // single char and multi char operators
    else if (tokenType === "SINGLEOP" || tokenType === "MULTIOP") {
      output.push(`${lineNumber} ${tokenText}`);
    }

    // all other printed token types
    else {
      output.push(`${lineNumber} ${tokenType} ${tokenText}`);
    }

    line = line.slice(tokenText.length);
    column += tokenText.length;
    line = line.trimStart();
  }

  return { lineOutput: output, hasError: hasError, stack: stack };
}
