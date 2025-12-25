import { Instruction } from './Instruction';

export class OrInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing OR: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
