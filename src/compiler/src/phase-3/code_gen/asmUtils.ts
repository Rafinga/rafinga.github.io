export class AsmUtils {
  // warning reg 3 is is not meant for asm helpers, only
  // for stack tracker and cache
  private scratchRegs = ["%rax", "%r11", "%rdx"];
  private intrScratchRegs = ["%eax", "%r11d", "%edx"];
  // private scratchRegs = ["%rax", "%rdx"];
  // private intrScratchRegs = ["%eax", "%edx"];
  // private scratchRegs = ["%r10", "%r11"];
  // private intrScratchRegs = ["%r10d", "%r11d"];

  constructor() {}

  public getScratchRegArray(isLong: boolean): string[] {
    return isLong ? [...this.scratchRegs] : [...this.intrScratchRegs];
  }
  public getLongScratchReg(index: number): string {
    return this.scratchRegs[index];
  }

  public getScratchReg(index: number): string {
    return this.intrScratchRegs[index];
  }

  public getInstrSuffix(isLong: boolean): string {
    return isLong ? "q" : "l";
  }

  public calculateNextAddressOffset(currentAddres: number, isLong: boolean) {
    const alignment = 8;
    return isLong && currentAddres % alignment == 0 ? 8 : isLong ? 12 : 4;
  }
  public buildMovInstructionStr(
    src1: string,
    src2: string,
    areLongs: boolean
  ): string {
    const suffix = areLongs ? "q" : "l";
    if (src1 === src2) {
      return "";
    }
    if (src1 === "$0" || src1 === "$0x0") {
      return `xor${suffix} ${src2}, ${src2}`;
    }

    return `mov${suffix} ${src1}, ${src2}`;
  }

  public buildRegMoveInstructionStr(
    src1: string,
    regIndex: number,
    isLong: boolean
  ): string {
    return this.buildMovInstructionStr(
      src1,
      this.getScratchRegArray(isLong)[regIndex],
      isLong
    );
  }

  public safeParseLong(value: string): bigint | null {
    if (/^-?\d+L$/.test(value)) {
      return BigInt(value.slice(0, -1));
    }
    return null;
  }

  public safeParseInt(value: string): bigint | null {
    if (/^-?\d+$/.test(value)) {
      return BigInt(value);
    }
    //bools are also ints
    if (/^-?\d+b$/.test(value)) {
      return BigInt(value.slice(0, -1));
    }
    return null;
  }
}
