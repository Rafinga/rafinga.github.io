import { Instruction } from './Instruction';

export class AndInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing AND: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
