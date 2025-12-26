import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class AndInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[0] & this.operandValues[1];
  }
  
  toString(): string {
    return `AND ${this.operandValues[0]} & ${this.operandValues[1]}`;
  }
}
