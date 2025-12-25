import { Instruction } from './Instruction';

export class MovInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing MOV: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
