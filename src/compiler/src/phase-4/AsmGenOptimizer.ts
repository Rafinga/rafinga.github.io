export class AsmGenOptimizer {
  constructor(private genAsm: string) { }

  public optimize(): string {
    const commentPass = this.removeComments();
    const duplicatePass = this.removeTempRegs(commentPass);
    const redundantPass = this.removeRedundantMoves(duplicatePass);
    return redundantPass;
  }

  private removeComments(): string {
    const curAsm = this.genAsm;
    const whiteSpaceRegex = /^\s$/;
    const splitAsm = curAsm.split("\n");

    const commentLessAsm = splitAsm.filter(
      (line) =>
        !line.startsWith("#") &&
        !whiteSpaceRegex.test(line) &&
        line.length !== 0
    );
    return commentLessAsm.join("\n");
  }
  private removeTempRegs(curAsm: string): string {
    //todo this doesn't work with normal reg alloc,
    //fix in future
    const splitAsm = curAsm.split("\n");
    const passThroughAsm: string[] = [];
    const skippedIndexes: Set<Number> = new Set();
    splitAsm.forEach((asmLine, index) => {
      if (skippedIndexes.has(index)) {
        return;
      }
      if (index === splitAsm.length - 1) {
        passThroughAsm.push(asmLine);
        return;
      }
      const nextIdx = index + 1;
      const nextAsm = splitAsm[nextIdx];
      if (
        !asmLine.startsWith("mov") ||
        !nextAsm.startsWith("mov") ||
        nextAsm.startsWith("movsx") ||
        nextAsm.startsWith("movzx")
      ) {
        passThroughAsm.push(asmLine);
        return;
      }
      const instr = asmLine.slice(0, 5); // movq or movl movsz
      const args = this.extractOperands(asmLine, instr);
      const nextArgs = this.extractOperands(nextAsm, instr);
      if (args.dest !== nextArgs.src || !this.isRegArg(args.dest)) {
        passThroughAsm.push(asmLine);
        return;
      }
      if (!this.isRegArg(args.src) && !this.isRegArg(nextArgs.dest)) {
        passThroughAsm.push(asmLine);
        return;
      }

      if (
        (instr === "movzx" || instr == "movsx") &&
        !this.isRegArg(nextArgs.dest)
      ) {
        passThroughAsm.push(asmLine);
        return;
      }
      skippedIndexes.add(nextIdx);
      const fusedInstr = `${instr} ${args.src}, ${nextArgs.dest}`;
      passThroughAsm.push(fusedInstr);
      //   passThroughAsm.push(asmLine);
    });
    return passThroughAsm.join("\n");
  }

  private isRegArg(arg: string): boolean {
    return arg.startsWith("%");
  }

  private extractOperands(
    asmLine: string,
    instructionName: string
  ): { src: string; dest: string } {
    const args = asmLine
      .slice(instructionName.length)
      .split(",")
      .map((arg) => arg.trim());
    return { src: args[0], dest: args[1] };
  }

  public removeRedundantMoves(curAsm: string): string {
    const splitAsm = curAsm.split("\n");
    const passThroughAsm: string[] = [];
    const skippedIndexes: Set<Number> = new Set();

    splitAsm.forEach((asmLine, index) => {
      if (skippedIndexes.has(index)) {
        return;
      }
      if (index === splitAsm.length - 1) {
        passThroughAsm.push(asmLine);
        return;
      }

      const nextIdx = index + 1;
      const nextAsm = splitAsm[nextIdx];

      // Check if both lines are mov instructions
      if (!asmLine.startsWith("mov") || !nextAsm.startsWith("mov")) {
        passThroughAsm.push(asmLine);
        return;
      }

      const instr = asmLine.slice(0, 5); // movq or movl
      const args = this.extractOperands(asmLine, instr);
      const nextArgs = this.extractOperands(nextAsm, instr);

      // Check if the registers are swapped
      if (args.src === nextArgs.dest && args.dest === nextArgs.src) {
        skippedIndexes.add(nextIdx);
        // Skip both instructions since they cancel each other out
        return;
      }

      passThroughAsm.push(asmLine);
    });

    return passThroughAsm.join("\n");
  }
}
