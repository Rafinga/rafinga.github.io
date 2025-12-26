import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class MovInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[0];
  }
  
  toString(): string {
    return `MOV ${this.operandValues[0]} -> destination`;
  }
}
