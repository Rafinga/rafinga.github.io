import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class CmpInstruction extends BinaryInstruction {
  private flags: Map<string, boolean>;

  constructor(line: string, memory: Memory, flags: Map<string, boolean>) {
    super(line, memory);
    this.flags = flags;
  }
  
  executeOperation(): bigint {
    // Compare operands (operand2 - operand1)
    const result = this.operandValues[1] - this.operandValues[0];
    
    // Set flags based on comparison result
    this.flags.set('zero', result === 0n);
    this.flags.set('sign', result < 0n);
    this.flags.set('overflow', false); // Simplified for now
    
    // CMP doesn't write to destination, just sets flags
    return 0n;
  }

  execute(): void {
    // Read operand values at execution time
    const size = this.isLong ? 8 : 4;
    this.operandValues = this.operands.map(op => this.memory.read(op, size));
    
    // Execute operation but don't write result (CMP doesn't modify operands)
    this.executeOperation();
  }
  
  toString(): string {
    return `CMP ${this.operandValues[0]} with ${this.operandValues[1]}`;
  }
}
