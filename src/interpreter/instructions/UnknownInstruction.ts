import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export class UnknownInstruction extends Instruction {
  constructor(line: string, memory: Memory) {
    super(memory);
  }
  
  execute(): void {
    console.log(`Unknown instruction - skipping`);
  }
  
  toString(): string {
    return `UNKNOWN`;
  }
}
