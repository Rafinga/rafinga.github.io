import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class DivInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[1] / this.operandValues[0];
  }
  
  toString(): string {
    return `DIV ${this.operandValues[1]} / ${this.operandValues[0]}`;
  }
}
