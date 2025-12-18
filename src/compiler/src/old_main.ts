// import { CLI, CompilerAction } from "./cli";
// import fs from "fs";
// import { scanFile } from "./phase-1/src/scanner";
// import { parse } from "./phase-1/src/parser";
// import path from "path";
// import { IrBuilder } from "./phase-2/semantics/ir_builder";
// import { astParser } from "./phase-1/src/parser";
// import { IrChecker } from "./phase-2/semantics/ir_checker";
// import { Method, Program } from "./phase-2/semantics/ir";
// import { ControlFlowGraph } from "./phase-3/cfg";
// import { AsmHelper } from "./phase-3/code_gen/asmHelpers";
// import { Optimizer } from "./phase-4/optimizer";
// import { WebBuilder } from "./phase-4/WebAllocator";
// import { getCallKilledReges, LongReg } from "./phase-3/RegTypes";
// import { removeRedundantMoves } from "./phase-4/utils";

// /**
//  * Entry point for the Decaf compiler
//  */

// function irGen(): Program {
//   if (!CLI.input_file) {
//     console.error(
//       "Error: No input file specified for intermediate code generation."
//     );
//     process.exit(1);
//   }

//   // Check Lexical Errors
//   const result = scanFile(CLI.input_file);
//   if (result.hasError) {
//     for (const line of result.output) {
//       if (line.includes("unexpected")) {
//         let newLine = "Lexical error at " + line;
//         console.error(newLine);
//       }
//     }
//     process.exit(1);
//   }

//   // Check Parse Errors
//   let hasError = parse(CLI.input_file);
//   if (hasError.length > 0) {
//     console.error(hasError.join("\n"));
//     process.exit(1);
//   }

//   // Check Semantic Errors
//   try {
//     const parsed = astParser(CLI.input_file);
//     const ir = new IrBuilder(parsed);
//     const program = ir.buildProgram();
//     const ir_building_error_messages = ir.getErrorMessages();
//     const ir_checking_error_messages = new IrChecker(
//       program,
//       CLI.input_file
//     ).run();
//     if (
//       ir_building_error_messages.length > 0 ||
//       ir_checking_error_messages.length > 0
//     ) {
//       console.error(ir_building_error_messages.join("\n"));
//       console.error(ir_checking_error_messages.join("\n"));
//       process.exit(1);
//     } else {
//       console.log("No semantic errors found.");
//     }
//     return program;
//   } catch (error) {
//     console.error(`Parsing syntax errors further down the tree: ${error}`);
//     process.exit(1);
//   }
// }

// function main() {
//   CLI.parse();

//   switch (CLI.target) {
//     case CompilerAction.scan:
//       if (!CLI.input_file) {
//         console.error("Error: No input file specified for scanning.");
//         process.exit(1);
//       }

//       let outputFile = CLI.output_file;
//       const inputFile = CLI.input_file;

//       if (!outputFile) {
//         outputFile = inputFile.endsWith(".dcf")
//           ? inputFile.replace(/\.dcf$/, ".txt")
//           : `${inputFile}.txt`;
//       }

//       try {
//         const result = scanFile(inputFile);
//         const outputDir = path.dirname(outputFile);

//         if (!fs.existsSync(outputDir)) {
//           fs.mkdirSync(outputDir, { recursive: true });
//         }

//         fs.writeFileSync(outputFile, result.output, "utf-8");
//         console.log(`Output written to ${outputFile}`);

//         process.exit(result.hasError ? 1 : 0);
//       } catch (error) {
//         console.error(`Error processing file: ${inputFile}`);
//         console.error(
//           error instanceof Error ? error.message : "Unknown error occurred."
//         );
//         process.exit(1);
//       }

//     case CompilerAction.parse:
//       if (!CLI.input_file) {
//         console.error("Error: No input file specified for parsing.");
//         process.exit(1);
//       }

//       try {
//         let hasError = parse(CLI.input_file);

//         // If `parse()` returns a number > 0, exit with error code
//         if (hasError.length > 0) {
//           console.error(
//             `Parsing failed with ${hasError.length} syntax errors.`
//           );
//           process.exit(1);
//         }

//         console.log("Parsing completed successfully.");
//       } catch (error) {
//         console.error(`Parsing failed for file: ${CLI.input_file}`);
//         console.error(
//           error instanceof Error ? error.message : "Unknown error occurred."
//         );
//         process.exit(1);
//       }

//     case CompilerAction.inter:
//       irGen();
//       break;

//     case CompilerAction.assembly:
//       const asmOutFile = CLI.output_file;
//       if (!asmOutFile) {
//         console.error(`no output file to write to`);
//         process.exit(1);
//       }
//       const program = irGen();
//       const cfgBuilder = new ControlFlowGraph(program);
//       const optimizer = new Optimizer(cfgBuilder, [
//         ...program.methods.values(),
//       ]);

//       const allOptimizations = [
//         "cp",
//         "cse",
//         "dce",
//         "algebra",
//         "fold",
//         "regalloc",
//         "inline",
//       ];

//       const rawOpts = CLI.optimizations;
//       let enabledOpts: Set<string>;

//       if (rawOpts.includes("all")) {
//         enabledOpts = new Set(allOptimizations);
//       } else {
//         enabledOpts = new Set(rawOpts);
//       }

//       // Process exclusions like -cse
//       for (const opt of rawOpts) {
//         if (opt.startsWith("-")) {
//           enabledOpts.delete(opt.slice(1));
//         }
//       }

//       let cfg;
//       if (enabledOpts.size === 0) {
//         // No optimizations specified, use pure CFG
//         cfg = cfgBuilder.buildCFG();
//       } else {
//         optimizer.setOptimizationFlags({
//           constantPropagation: enabledOpts.has("cp"),
//           deadCodeElimination: enabledOpts.has("dce"),
//           algebraicSimplification: enabledOpts.has("algebra"),
//           commonSubexprElimination: enabledOpts.has("cse"),
//           constantFolding: enabledOpts.has("fold"),
//           loopOptimization: enabledOpts.has("loop"),
//           inline: enabledOpts.has("inline"),
//         });
//         cfg = optimizer.buildNodes();
//         // const linScan = new ProgramLinearScanner(cfg, cfgBuilder);
//         // linScan.allocateRegisters();
//       }
//       const methodRegesKilled = new Map<string, Set<LongReg>>();
//       const asmHelper = new AsmHelper(methodRegesKilled);
//       const importList = Array.from(program.imports.keys());
//       const literalMap = program.stringLiteralMap;
//       let programContent =
//         asmHelper.buildProgramHeader(importList, literalMap, program.natives) +
//         "\n";
//       asmHelper.preLoadProgramMethods(Array.from(program.methods.values()));
//       cfg.forEach((block, index) => {
//         const method = program.methods.get(
//           cfgBuilder.orderedMethods.at(index)!
//         ) as Method;
//         if (enabledOpts.has("regalloc")) {
//           const initRegesKilled = getCallKilledReges(
//             method.params.ordered_params.length
//           );
//           methodRegesKilled.set(method.method_name, new Set(initRegesKilled));
//           const webBuilder = new WebBuilder(
//             block,
//             cfgBuilder,
//             methodRegesKilled
//           );
//           webBuilder.buildInterferenceNodes();
//           asmHelper.setWebMap(webBuilder.webMap);
//         }
//         programContent += asmHelper.buildMethodAsm(method, block);
//       });
//       const cleanAsm = removeAsmComments(programContent);
//       programContent = removeRedundantMoves(cleanAsm);
//       // const genOptmizer = new AsmGenOptimizer(cleanAsm);
//       // const optimizedAsm = genOptmizer.optimize();
//       fs.writeFileSync(asmOutFile, programContent, "utf-8");
//       console.log(`Output written to ${asmOutFile}`);
//   }
// }

// if (require.main === module) {
//   main();
// }

// function removeAsmComments(code: string): string {
//   return code
//     .split("\n")
//     .filter((line) => !line.startsWith(";") && !line.startsWith("#"))
//     .join("\n");
// }

// export { main };
