import { Instruction } from './Instruction';

export class MulInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing MUL/IMUL: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
