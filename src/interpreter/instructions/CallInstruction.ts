import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export class CallInstruction extends Instruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  execute(): void {
    console.log(`CALL instruction not implemented yet`);
  }
  
  toString(): string {
    return `CALL (not implemented)`;
  }
}
