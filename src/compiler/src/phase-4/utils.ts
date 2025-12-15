//idk why typsecript doesn't have this already

import {
  BinExpr,
  BoolLiteral,
  IntLiteral,
  LongLiteral,
} from "../phase-2/semantics/ir";
import { Span, Position } from "../phase-2/span";
import { ControlFlowGraph } from "../phase-3/cfg";
import {
  BasicBlock,
  BinOpInstruction,
  CopyInstruction,
  Instruction,
} from "../phase-3/cfgTypes";

export function areSetsEqual(set1: Set<any>, set2: Set<any>): boolean {
  return setUnion(set1, set2).size === setIntersection(set1, set2).size;
}

export function setSample<T>(set: Set<T>): T {
  return set.values().next().value as T;
}

export function setPop<T>(set: Set<T>): T {
  if (set.size === 0) {
    throw new Error("Set is empty");
  }
  const poppedVal = set.values().next().value as T;
  set.delete(poppedVal);
  return poppedVal;
}
export function setUnion<T extends { toString(): string }>(
  a: Set<T>,
  b: Set<T>
): Set<T> {
  const fusedArray = [...a, ...b];
  const stringSet = new Set(fusedArray.map((x) => x.toString()));

  const filteredArray = fusedArray.filter((elt) => {
    const hasElt = stringSet.has(elt.toString());
    stringSet.delete(elt.toString());
    return hasElt;
  });

  return new Set(filteredArray);
}

export function strictSetUnion<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

export function setIntersection<T extends { toString(): string }>(
  a: Set<T>,
  b: Set<T>
): Set<T> {
  const stringSet = new Set([...b].map((x) => x.toString()));
  return new Set([...a].filter((x) => stringSet.has(x.toString())));
}

export function strictSetIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((elt) => b.has(elt)));
}

export function setDifference<T extends { toString(): string }>(
  a: Set<T>,
  b: Set<T>
): Set<T> {
  const stringSet = new Set([...b].map((x) => x.toString()));
  return new Set([...a].filter((x) => !stringSet.has(x.toString())));
}

export function getSplitName(name: string): string {
  const splitName = name.split(/\[|\]/);
  if (splitName.length > 1) {
    return splitName[1];
  }
  return splitName[0];
}

export function safeExtractNum(value: string): string | null {
  const intParse = safeParseInt(value);
  const longParse = safeParseLong(value);
  const boolParse = safeParseBool(value);
  if (longParse !== null) {
    return `${longParse}L`;
  }
  if (intParse !== null) {
    return intParse.toString();
  }
  if (boolParse !== null) {
    return `${boolParse}b`;
  }
  return null;
}

export function safeParseLong(value: string): bigint | null {
  if (/^-?\d+L$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return null;
}

export function safeParseInt(value: string): bigint | null {
  if (/^-?\d+$/.test(value)) {
    return BigInt(value);
  }
  return null;
}

export function safeParseBool(value: string): string | null {
  //bools are also ints
  if (/^-?\d+b$/.test(value)) {
    return value.slice(0, -1);
  }
  return null;
}

export function foldInstr(instr: Instruction): Instruction {
  if (instr instanceof BinOpInstruction) {
    return foldBinOpInstr(instr);
  }
  //todo check on other instructions in the future maybe
  return instr;
}

export function foldBinOpInstr(instr: BinOpInstruction): Instruction {
  const fakeSpan = new Span(new Position(-1, -1), new Position(-1, -1));
  const num1 = safeParseInt(instr.expr1);
  const num2 = safeParseInt(instr.expr2);
  const num1L = safeParseLong(instr.expr1);
  const num2L = safeParseLong(instr.expr2);
  const num1b = safeParseBool(instr.expr1);
  const num2b = safeParseBool(instr.expr2);
  if (num1L !== null && num2L !== null) {
    const tempExpr1 = new LongLiteral(BigInt(num1L), fakeSpan);
    const tempExpr2 = new LongLiteral(BigInt(num2L), fakeSpan);
    const wrapperExpr = new BinExpr(
      tempExpr1,
      instr.binOp,
      tempExpr2,
      fakeSpan
    );
    const result = ControlFlowGraph.constantFold(wrapperExpr);
    if (result instanceof BoolLiteral) {
      return new CopyInstruction(instr.dest, result.b ? "1b" : "0b");
    }
    if (result instanceof LongLiteral) {
      return new CopyInstruction(instr.dest, `${result.val.toString()}L`);
    }
  }
  if (num1 !== null && num2 !== null) {
    const tempExpr1 = new IntLiteral(Number(num1), fakeSpan);
    const tempExpr2 = new IntLiteral(Number(num2), fakeSpan);

    const wrapperExpr = new BinExpr(
      tempExpr1,
      instr.binOp,
      tempExpr2,
      fakeSpan
    );
    const result = ControlFlowGraph.constantFold(wrapperExpr);
    if (result instanceof BoolLiteral) {
      return new CopyInstruction(instr.dest, result.b ? "1b" : "0b");
    }
    if (result instanceof IntLiteral) {
      return new CopyInstruction(instr.dest, result.val.toString());
    }
  }
  if (num1b !== null && num2b !== null) {
    const tempExpr1 = new BoolLiteral(num1b === "1", fakeSpan);
    const tempExpr2 = new BoolLiteral(num2b === "1", fakeSpan);
    const wrapperExpr = new BinExpr(
      tempExpr1,
      instr.binOp,
      tempExpr2,
      fakeSpan
    );
    const result = ControlFlowGraph.constantFold(wrapperExpr) as BoolLiteral;
    return new CopyInstruction(instr.dest, result.b ? "1b" : "0b");
  }
  return instr;
}

export function isArrayVariable(key: string): boolean {
  return getSplitName(key) !== key;
}

export function getPowOf2(numStr: string): null | string {
  const isNotInt = numStr.endsWith("b") || numStr.endsWith("L");
  const extension = isNotInt ? numStr.slice(-1) : "";
  const parsedNum = isNotInt ? numStr.slice(0, -1) : numStr;
  try {
    const n = BigInt(parsedNum);
    if (n <= 0n || (n & (n - 1n)) !== 0n) return null;

    let exponent = 0;
    let value = n;
    while (value > 1n) {
      value >>= 1n;
      exponent++;
    }
    return exponent.toString() + extension;
  } catch {
    return null; // Invalid input
  }
}

export function getNegPowOf2(numStr: string): null | string {
  if (!numStr.startsWith("-")) {
    return null;
  }
  return getPowOf2(numStr.slice(1));
}

/**
 * Collect all blocks reachable from the entry block of a method.
 */
export function collectAllBlocks(entry: BasicBlock): BasicBlock[] {
  const visited = new Set<BasicBlock>();
  const stack = [entry];
  while (stack.length > 0) {
    const block = stack.pop()!;
    if (!visited.has(block)) {
      visited.add(block);
      if (block.joinSuccessor) stack.push(block.joinSuccessor);
      if (block.branchSuccessors) {
        stack.push(block.branchSuccessors.trueBlock);
        stack.push(block.branchSuccessors.falseBlock);
      }
    }
  }
  return Array.from(visited);
}

export function removeRedundantMoves(asm: string): string {
  const lines = asm.split("\n");
  const optimizedLines: string[] = [];
  const skippedIndices = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (skippedIndices.has(i)) continue;

    const currentLine = lines[i].trim();
    if (!currentLine) {
      optimizedLines.push(lines[i]);
      continue;
    }

    // Skip if it's a label or jump instruction
    if (currentLine.endsWith(":") || currentLine.startsWith("j")) {
      optimizedLines.push(lines[i]);
      continue;
    }

    // Check for redundant moves
    if (currentLine.startsWith("mov")) {
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";

      // Case 1: mov reg1, reg2 followed by mov reg2, reg1
      if (nextLine.startsWith("mov")) {
        const currentArgs = currentLine.split(",").map((arg) => arg.trim());
        const nextArgs = nextLine.split(",").map((arg) => arg.trim());

        if (currentArgs[0] === nextArgs[1] && currentArgs[1] === nextArgs[0]) {
          // These moves cancel each other out
          skippedIndices.add(i + 1);
          continue;
        }
      }

      // Case 2: mov $0, reg followed by xor reg, reg
      if (currentLine.includes("$0") && nextLine.startsWith("xor")) {
        const reg = currentLine.split(",")[1].trim();
        if (nextLine.includes(reg)) {
          skippedIndices.add(i + 1);
          optimizedLines.push(
            `xor${currentLine.includes("q") ? "q" : "l"} ${reg}, ${reg}`
          );
          continue;
        }
      }
    }

    // Check for redundant stack operations
    if (currentLine.startsWith("subq $") && currentLine.endsWith(", %rsp")) {
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (nextLine.startsWith("addq $") && nextLine.endsWith(", %rsp")) {
        const subAmount = parseInt(currentLine.split("$")[1]);
        const addAmount = parseInt(nextLine.split("$")[1]);
        if (subAmount === addAmount) {
          skippedIndices.add(i + 1);
          continue;
        }
      }
    }

    optimizedLines.push(lines[i]);
  }

  return optimizedLines.join("\n");
}
