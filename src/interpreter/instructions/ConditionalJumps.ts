import { JumpInstruction } from './JumpInstruction';
import { LabelInstruction } from './LabelInstruction';
import { Memory } from '../Memory';

export class JmpInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    return true; // Unconditional jump
  }
}

export class JeInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    return this.flags.get('zero')!; // Jump if equal (zero flag set)
  }
}

export class JneInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    return !this.flags.get('zero')!; // Jump if not equal (zero flag clear)
  }
}

export class JlInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    // Jump if less (sign flag != overflow flag)
    const sign = this.flags.get('sign')!;
    const overflow = this.flags.get('overflow')!;
    return sign !== overflow;
  }
}

export class JgInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    // Jump if greater (zero flag clear AND sign flag == overflow flag)
    const zero = this.flags.get('zero')!;
    const sign = this.flags.get('sign')!;
    const overflow = this.flags.get('overflow')!;
    return !zero && (sign === overflow);
  }
}

export class JleInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    // Jump if less or equal (zero flag set OR sign flag != overflow flag)
    const zero = this.flags.get('zero')!;
    const sign = this.flags.get('sign')!;
    const overflow = this.flags.get('overflow')!;
    return zero || (sign !== overflow);
  }
}

export class JgeInstruction extends JumpInstruction {
  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(line, memory, labelMap, flags);
  }

  shouldJump(): boolean {
    // Jump if greater or equal (sign flag == overflow flag)
    const sign = this.flags.get('sign')!;
    const overflow = this.flags.get('overflow')!;
    return sign === overflow;
  }
}
