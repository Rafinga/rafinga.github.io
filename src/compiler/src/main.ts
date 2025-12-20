import { tokenize } from "./phase-1/src/scanner";
import { webParse, webAstParser } from "./phase-1/src/parser";
import { IrBuilder } from "./phase-2/semantics/ir_builder";
import { IrChecker } from "./phase-2/semantics/ir_checker";
import { Method, Program } from "./phase-2/semantics/ir";
import { ControlFlowGraph } from "./phase-3/cfg";
import { AsmHelper } from "./phase-3/code_gen/asmHelpers";
import { Optimizer } from "./phase-4/optimizer";
import { WebBuilder } from "./phase-4/WebAllocator";
import { getCallKilledReges, LongReg } from "./phase-3/RegTypes";
import { removeRedundantMoves } from "./phase-4/utils";
import { visualizeMethod, resetVisualization } from "./phase-3/visualizer";

/**
 * Entry point for the Decaf compiler
 */

function irGen(webProgram: string): Program {
  // Check Lexical Errors
  const result = tokenize(webProgram, webProgram);
  if (result.hasError) {
    const errors = [];
    for (const line of result.output) {
      if (line.includes("unexpected")) {
        errors.push("Lexical error at " + line);
      }
    }
    throw new Error(errors.join("\n"));
  }

  // Check Parse Errors
  let hasError = webParse(webProgram);
  if (hasError.length > 0) {
    throw new Error(hasError.join("\n"));
  }

  // Check Semantic Errors
  try {
    const parsed = webAstParser(webProgram);
    const ir = new IrBuilder(parsed);
    const program = ir.buildProgram();
    const ir_building_error_messages = ir.getErrorMessages();
    const ir_checking_error_messages = new IrChecker(program, "").run();
    if (
      ir_building_error_messages.length > 0 ||
      ir_checking_error_messages.length > 0
    ) {
      const allErrors = [
        ...ir_building_error_messages,
        ...ir_checking_error_messages,
      ];
      throw new Error(allErrors.join("\n"));
    }
    return program;
  } catch (error) {
    throw new Error(`Parsing syntax errors further down the tree: ${error}`);
  }
}

function removeAsmComments(code: string): string {
  return code
    .split("\n")
    .filter((line) => !line.startsWith(";") && !line.startsWith("#"))
    .join("\n");
}

export function compileWeb(
  inputCode: string,
  enabledOptimizations: string[] = [
    "cp",
    "cse",
    "dce",
    "algebra",
    "fold",
    "regalloc",
    "inline",
  ],
  canvas?: HTMLCanvasElement
): {
  success: boolean;
  assembly?: string;
  errors: string[];
} {
  try {
    // Reset visualization on new compilation
    resetVisualization();
    
    const program = irGen(inputCode);
    const cfgBuilder = new ControlFlowGraph(program);
    const optimizer = new Optimizer(cfgBuilder, [...program.methods.values()]);

    const enabledOpts = new Set(enabledOptimizations);

    let cfg;
    if (enabledOpts.size === 0) {
      cfg = cfgBuilder.buildCFG();
    } else {
      optimizer.setOptimizationFlags({
        constantPropagation: enabledOpts.has("cp"),
        deadCodeElimination: enabledOpts.has("dce"),
        algebraicSimplification: enabledOpts.has("algebra"),
        commonSubexprElimination: enabledOpts.has("cse"),
        constantFolding: enabledOpts.has("fold"),
        loopOptimization: enabledOpts.has("loop"),
        inline: enabledOpts.has("inline"),
      });
      cfg = optimizer.buildNodes();
    }

    const methodRegesKilled = new Map<string, Set<LongReg>>();
    const asmHelper = new AsmHelper(methodRegesKilled);
    const importList = Array.from(program.imports.keys());
    const literalMap = program.stringLiteralMap;
    let programContent =
      asmHelper.buildProgramHeader(importList, literalMap, program.natives) +
      "\n";
    asmHelper.preLoadProgramMethods(Array.from(program.methods.values()));

    cfg.forEach((block, index) => {
      const method = program.methods.get(
        cfgBuilder.orderedMethods.at(index)!
      ) as Method;
      if (enabledOpts.has("regalloc")) {
        const initRegesKilled = getCallKilledReges(
          method.params.ordered_params.length
        );
        methodRegesKilled.set(method.method_name, new Set(initRegesKilled));
        const webBuilder = new WebBuilder(block, cfgBuilder, methodRegesKilled);
        webBuilder.buildInterferenceNodes();
        asmHelper.setWebMap(webBuilder.webMap);
      }
      if (canvas) {
        visualizeMethod(method, block, canvas);
      }
      programContent += asmHelper.buildMethodAsm(method, block);
    });

    const cleanAsm = removeAsmComments(programContent);
    const finalAsm = removeRedundantMoves(cleanAsm);

    return { success: true, assembly: finalAsm, errors: [] };
  } catch (error) {
    return { success: false, errors: [String(error)] };
  }
}
