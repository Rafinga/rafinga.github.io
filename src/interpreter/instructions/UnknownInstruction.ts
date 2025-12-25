import { Instruction } from './Instruction';

export class UnknownInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Unknown instruction: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
