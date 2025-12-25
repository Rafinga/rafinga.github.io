import { Instruction } from './Instruction';

export class DivInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing DIV/IDIV: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
