import { IrBuilder } from "../phase-2/semantics/ir_builder";
import { astParser } from "../phase-1/src/parser";
import { ControlFlowGraph } from "./cfg";
import {
  convertToSSA,
  visualizeDetailedCfgTreeDot,
  visualizeDominatorTree,
} from "./ssa";
import { renderGraphFromSource } from "graphviz-cli";
import { Optimizer } from "../phase-4/optimizer";
import { ProgramLinearScanner } from "../phase-4/linearRegScanner";
import { reverse } from "dns";
import { WebBuilder } from "../phase-4/WebAllocator";

export async function visualizeFile(input_file: string, is_optimized: boolean, regAlloc: boolean) {
  const parsed = astParser(input_file);
  const ir = new IrBuilder(parsed);
  const program = ir.buildProgram();

  // const parsed2 = astParser(input_file);
  // const ir2 = new IrBuilder(parsed2);
  // const program2 = ir2.buildProgram();

  const path = require("path");
  const fs = require("fs");
  const basename = path.basename(input_file, path.extname(input_file));
  const cfgOutputDir = "cfg_visuals";
  const ssaOutputDir = "ssa_visuals"; // New directory for SSA visuals

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(cfgOutputDir)) {
    fs.mkdirSync(cfgOutputDir);
  }
  if (!fs.existsSync(ssaOutputDir)) {
    fs.mkdirSync(ssaOutputDir);
  }
  const cfgBuilder = new ControlFlowGraph(program);
  let cfg;
  if (is_optimized) {
    const optimizer = new Optimizer(cfgBuilder, [...program.methods.values()]);
    optimizer.setOptimizationFlags({
      constantPropagation: true,
      deadCodeElimination: true,
      algebraicSimplification: true,
      commonSubexprElimination: true,
      constantFolding: true,
      loopOptimization: false,
      inline: true,
    });
    cfg = optimizer.buildNodes();
    //let linScan = new ProgramLinearScanner(cfg, cfgBuilder);
    //linScan.allocateRegisters();
  } else {
    cfg = cfgBuilder.buildCFG();
  }
  // Generate visualization for each method
  for (const methodName of program.methods.keys()) {
    const method = program.methods.get(methodName);
    if (!method) {
      throw new Error(`Method ${methodName} not found in program.`);
    }
    // const cfgBuilder = new ControlFlowGraph(program);
    // const entryBlock = cfgBuilder.buildMethodCFG(method);
    const methodIdx = cfgBuilder.orderedMethods.indexOf(methodName);
    const entryBlock = cfg[methodIdx];
    if (regAlloc) {
      const noStuck = new WebBuilder(entryBlock, cfgBuilder, new Map());
      console.log(noStuck.buildInterferenceNodes());
    }
    // ✅ Call the standalone function and pass in the entry block
    const dot = visualizeDetailedCfgTreeDot(entryBlock);
    // Include method name in the output filename
    let outputPath;
    if (is_optimized && regAlloc) {
      outputPath = path.join(
        cfgOutputDir,
        `${basename}_${methodName}_reg_optimized_visualization.png`
      );
    } else if (is_optimized) {
      outputPath = path.join(
        cfgOutputDir,
        `${basename}_${methodName}_no_reg_optimized_visualization.png`
      );
    } else {
      outputPath = path.join(
        cfgOutputDir,
        `${basename}_${methodName}_unoptimized_visualization.png`
      );
    }

    // Render the DOT to PNG in the visualizations folder
    try {
      await renderGraphFromSource(
        { input: dot },
        { format: "png", name: outputPath }
      );
      console.log(
        `Visualization saved for method ${methodName} to: ${outputPath}`
      );
    } catch (error) {
      console.error(
        `Error generating visualization for method ${methodName}:`,
        error
      );
    }

    // // SSA CFG
    //   try {
    //     const method = program.methods.get(methodName);
    //     if (!method) {
    //       throw new Error(`Method ${methodName} not found in program.`);
    //     }
    //     const cfgBuilder = new ControlFlowGraph(program2);
    //     const optimizer = new Optimizer(cfgBuilder);
    //     const cfg = optimizer.buildNodes();

    // const methodIdx = cfgBuilder.orderedMethods.indexOf(methodName);
    // const entryBlock = cfg[methodIdx];

    //     // ✅ Call the standalone function and pass in the entry block
    //     const ssaDot = visualizeDetailedCfgTreeDot(entryBlock);
    //     // const ssaDot = visualizeDominatorTree(ssaEntry);

    //     const ssaOutputPath = path.join(
    //       ssaOutputDir,
    //       `${basename}_${methodName}_ssa.png`
    //     );
    //     await renderGraphFromSource(
    //       { input: ssaDot },
    //       { format: "png", name: ssaOutputPath }
    //     );
    //     console.log(
    //       `SSA visualization saved for method ${methodName} to: ${ssaOutputPath}`
    //     );
    //   } catch (error) {
    //     console.error(`Error generating SSA for method ${methodName}:`, error);
    //   }
  }
}
