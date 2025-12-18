import { CharStreams, CommonTokenStream, ErrorListener, Token } from "antlr4";
import DecafParser, { ProgramContext } from "../generated_antlr_ts/DecafParser";
import DecafLexer from "../generated_antlr_ts/DecafLexer";
// import DecafVisitor from "../visitor/DecafVisitor";
import * as fs from "fs";

export function astParser(fileName: string): ProgramContext {
  const source = fs.readFileSync(fileName, "utf-8");
  let stream = CharStreams.fromString(source);
  let lexer = new DecafLexer(stream);
  let token_stream = new CommonTokenStream(lexer);
  let parser = new DecafParser(token_stream);
  parser.removeErrorListeners();

  return parser.program();
}

export function webAstParser(webProgram: string): ProgramContext {
  console.log(webProgram);
  let stream = CharStreams.fromString(webProgram);
  let lexer = new DecafLexer(stream);
  let token_stream = new CommonTokenStream(lexer);
  let parser = new DecafParser(token_stream);
  parser.removeErrorListeners();

  return parser.program();
}

class CustomErrorListener extends ErrorListener<Token> {
  errors: string[] = [];

  syntaxError(
    recognizer: any,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    e: any
  ) {
    this.errors.push(`Parsing error at line ${line}, column ${column}: ${msg}`);
  }

  getErrors(): string[] {
    return this.errors;
  }
}

// export function parse(fileName: string): Array<string> {
//   const source = fs.readFileSync(fileName, "utf-8");
//   let stream = CharStreams.fromString(source);
//   let lexer = new DecafLexer(stream);
//   let token_stream = new CommonTokenStream(lexer);
//   let parser = new DecafParser(token_stream);
//   parser.removeErrorListeners();
//   const errorListener = new CustomErrorListener();
//   parser.addErrorListener(errorListener);

//   let tree = parser.program();
//   //console.log(tree)
//   return errorListener.getErrors();
// }

export function webParse(content: string) {
  console.log(content);
  const stream = CharStreams.fromString(content);
  const lexer = new DecafLexer(stream);
  const token_stream = new CommonTokenStream(lexer);
  const parser = new DecafParser(token_stream);
  parser.removeErrorListeners();
  const errorListener = new CustomErrorListener();
  parser.addErrorListener(errorListener);
  const tree = parser.program();
  //console.log(tree)
  return errorListener.getErrors();
}
