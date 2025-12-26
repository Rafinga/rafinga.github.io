import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export class CallInstruction extends Instruction {
  constructor(line: string, memory: Memory) {
    super(line, memory);
  }
  
  execute(): bigint {
    console.log(`CALL instruction not implemented yet`);
    return 0n;
  }
  
  toString(): string {
    return `CALL (not implemented)`;
  }
}
