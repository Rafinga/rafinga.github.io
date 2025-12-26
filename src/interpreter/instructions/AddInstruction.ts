import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class AddInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[0] + this.operandValues[1];
  }
  
  toString(): string {
    return `ADD ${this.operandValues[0]} + ${this.operandValues[1]}`;
  }
}
