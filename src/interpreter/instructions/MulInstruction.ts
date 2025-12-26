import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class MulInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[0] * this.operandValues[1];
  }
  
  toString(): string {
    return `MUL ${this.operandValues[0]} * ${this.operandValues[1]}`;
  }
}
