import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export class DivInstruction extends Instruction {
  private divisor: string;

  constructor(line: string, memory: Memory) {
    super(memory);
    
    // Parse the single divisor operand
    const parts = line.trim().split(/\s+/);
    const instruction = parts[0];
    this.isLong = instruction.endsWith('q');
    this.divisor = parts[1];
  }
  
  execute(): void {
    const size = this.isLong ? 8 : 4;
    const dividendReg = this.isLong ? 'rax' : 'eax';
    const remainderReg = this.isLong ? 'rdx' : 'edx';
    
    // Get dividend from RAX/EAX
    const dividend = BigInt(this.memory.read(dividendReg, size));
    
    // Get divisor from operand
    const divisorValue = this.memory.read(this.divisor, size);
    
    if (divisorValue === 0n) {
      throw new Error('Division by zero');
    }
    
    // Calculate quotient and remainder
    const quotient = dividend / divisorValue;
    const remainder = dividend % divisorValue;
    
    // Store results
    this.memory.write(dividendReg, quotient, size);
    this.memory.write(remainderReg, remainder, size);
  }
  
  toString(): string {
    return `DIV ${this.divisor}`;
  }
}
