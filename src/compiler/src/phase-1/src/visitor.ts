// import {ProgramContext, Method_declContext} from "../../antlr/generated/DecafParser";

// export class DecafVisitor {
    
//     visitProgram(ctx: ProgramContext): void {
//         const methodCtxs = ctx.method_decl_list();
//         for (const f of methodCtxs) {
//             this.visitMethoddecl(f);
//         }
//     }

//     visitMethoddecl(ctx: Method_declContext): void {
//         console.log("method decl: " + ctx.ID()?.getText());
//     }
// }
