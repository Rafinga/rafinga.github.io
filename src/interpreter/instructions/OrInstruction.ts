import { BinaryInstruction } from './BinaryInstruction';
import { Memory } from '../Memory';

export class OrInstruction extends BinaryInstruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  executeOperation(): bigint {
    return this.operandValues[0] | this.operandValues[1];
  }
  
  toString(): string {
    return `OR ${this.operandValues[0]} | ${this.operandValues[1]}`;
  }
}
