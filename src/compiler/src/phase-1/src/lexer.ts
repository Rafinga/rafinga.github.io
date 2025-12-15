import { CharStreams, CommonTokenStream, Token } from "antlr4";
import DecafLexer from "../generated_antlr_ts/DecafLexer";
import * as fs from "fs";


export function lex(fileName: string) {
    const source = fs.readFileSync(fileName, "utf-8");
    let stream = CharStreams.fromString(source);
    let lexer = new DecafLexer(stream);

    let tokens: Token[] = [];
    let token = lexer.nextToken();

    while (token.type !== -1) { // EOF check
        tokens.push(token);
        token = lexer.nextToken();
    }

    for (let token of tokens) {
        let tokenType: string = lexer.getSymbolicNames()[token.type] || "UNKNOWN";
        //console.log(`${token.line} ${tokenType} ${token.text}`);
    }
}


