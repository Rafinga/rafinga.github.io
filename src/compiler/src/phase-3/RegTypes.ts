import { setUnion } from "../phase-4/utils";
import { Instruction } from "./cfgTypes";

export enum LongCallerSavedReg {
  rdi = "%rdi",
  rsi = "%rsi",
  rcx = "%rcx",
  r8 = "%r8",
  r9 = "%r9",
  r10 = "%r10",
}

export enum LongCalleeSavedReg {
  r12 = "%r12",
  r13 = "%r13",
  r14 = "%r14",
  r15 = "%r15",
  rbx = "%rbx",
}

export enum IntCallerSavedReg {
  edi = "%edi",
  esi = "%esi",
  ecx = "%ecx",
  r8d = "%r8d",
  r9d = "%r9d",
  r10d = "%r10d",
}

export enum IntCalleeSavedReg {
  r12d = "%r12d",
  r13d = "%r13d",
  r14d = "%r14d",
  r15d = "%r15d",
  ebx = "%ebx",
}
export enum ReservedLongReg {
  rax = "%rax",
  r11 = "%r11",
  rdx = "%rdx",
}

export type LongReg = LongCalleeSavedReg | LongCallerSavedReg;
export type IntReg = IntCalleeSavedReg | IntCallerSavedReg;
export type Reg = LongReg | IntReg | ReservedLongReg;
export enum literalType {
  bool,
  int,
  long,
}
export enum BranchType {
  ifElse,
  forLoop,
  whileLoop,
}

export function getAllRegs(): Set<Reg> {
  return setUnion<Reg>(getLongRegs(), getIntRegs());
}

export function getLongCallerSavedRegs(): Set<LongReg> {
  return new Set(Object.values(LongCallerSavedReg));
}

export function getLongCalleeSavedRegs(): Set<LongReg> {
  return new Set(Object.values(LongCalleeSavedReg));
}

export function getCallKilledReges(argLength: number): LongReg[] {
  const orderedMethodCallArgs = [
    LongCallerSavedReg.rdi,
    LongCallerSavedReg.rsi,
    //rdx is supposed to come here, but it is part of our scratch registers, so it will never be assigned
    // by the colorer
    LongCallerSavedReg.rcx,
    LongCallerSavedReg.r8,
    LongCallerSavedReg.r9,
  ];
  const sliceUsed = argLength > 2 ? argLength - 1 : argLength;
  return orderedMethodCallArgs.slice(0, sliceUsed);
}

export function getLongRegs(): Set<LongReg> {
  const callerSaved: Set<LongReg> = new Set(Object.values(LongCallerSavedReg));
  const calleeSaved: Set<LongReg> = new Set(Object.values(LongCalleeSavedReg));
  return setUnion(callerSaved, calleeSaved);
}

export function getIntRegs(): Set<IntReg> {
  const callerSaved: Set<IntReg> = new Set(Object.values(IntCallerSavedReg));
  const calleeSaved: Set<IntReg> = new Set(Object.values(IntCalleeSavedReg));
  return setUnion(callerSaved, calleeSaved);
}

export function castToIntReg(reg: Reg): IntReg {
  const dConventionRegex = /%r\d*$/;
  const eConventionRegex = /%r[^\d][^]*$/;
  if (dConventionRegex.test(reg.toString())) {
    return (reg.toString() + "d") as IntReg;
  }
  if (eConventionRegex.test(reg.toString())) {
    return reg.toString().replace("r", "e") as IntReg;
  }
  return reg as IntReg;
}

export function castToLongReg(reg: Reg): LongReg {
  const rConventionRegex = /%e[^]*$/;
  const dConventionRegex = /%r[^]*d$/;
  if (rConventionRegex.test(reg.toString())) {
    return reg.toString().replace("e", "r") as LongReg;
  }
  if (dConventionRegex.test(reg.toString())) {
    return reg.toString().slice(0, -1) as LongReg;
  }
  return reg as LongReg;
}

export function isLongReg(reg: Reg): boolean {
  return castToLongReg(reg) === reg;
}

export function isCallee(reg: Reg): boolean {
  const isLongCaller = Object.values(LongCalleeSavedReg).includes(
    reg as LongCalleeSavedReg
  );
  const isIntCaller = Object.values(IntCalleeSavedReg).includes(
    reg as IntCalleeSavedReg
  );
  return isLongCaller || isIntCaller;
}

export function isCaller(reg: Reg) {
  return !isCallee(reg);
}

// load value from memory to register
export class LoadRegInstruction extends Instruction {
  public constructor(
    public varName: string,
    public regUsed: LongReg,
    public lineNum: number
  ) {
    super();
  }

  public toString(): string {
    return `Load uncasted Register: ${this.regUsed} <- ${this.varName}`;
  }
}
