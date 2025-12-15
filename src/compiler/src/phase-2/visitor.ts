// import { ParserRuleContext, ParseTree } from "antlr4";
// import DecafParser, {
//   Field_declContext,
//   Import_declContext,
//   Method_declContext,
// } from "../phase-1/generated_antlr_ts/DecafParser";
// import { ProgramContext } from "../phase-1/generated_antlr_ts/DecafParser";
// import { ImportDecl, Program } from "./ast";
// import {Span, Position} from "./span";


// export class DecafLanguageVisitor {
//   program_children: Program = new Program();
//   visitProgram(ctx: ProgramContext): void {
//     // const start = new Position(ctx.start.line, 0);
//     // if (ctx.stop?.line) {
//     //   const end = new Position(ctx.stop?.line, 0);
//     // } else {
      
//     // }
//     // const end = new Position(ctx.stop?.line, 0);
//     // this.program_children.span = new Span(start, end);
//     console.log('start, stop', ctx.start.line, ctx.stop?.line);
//     const import_children = ctx.import_decl_list();
//     const field_children = ctx.field_decl_list();
//     const method_children = ctx.method_decl_list();


//     import_children.forEach((child) => {
//       this.visitProgramImportDecl(child, this.program_children);
//     });
//     field_children.forEach((child) => {
//       this.visitProgramFieldDecl(child, this.program_children);
//     });
//     method_children.forEach((child) => {
//       this.visitProgramMethodDecl(child, this.program_children);
//     });
//   } 

//   visitProgramImportDecl(antlrNode: Import_declContext, parent: Program): void {
//     const id = new ImportDecl(antlrNode.ID.toString());
//     parent.importDecls.push(id);
//   }

//   visitProgramMethodDecl(antlrNode: Method_declContext, parent: Program): void { 
//     // console.log("method: " + treeNode.getText());
//   }

//   visitProgramFieldDecl(antlrNode: Field_declContext, parent: Program): void {
//     const id = new ImportDecl(antlrNode.ID.toString());
//     parent.importDecls.push(id);

//     const import_array_field_children = antlrNode.array_field_decl_list();
//     import_array_field_children.forEach(array_field_decl=>{
      

//     });


//   }
// }
