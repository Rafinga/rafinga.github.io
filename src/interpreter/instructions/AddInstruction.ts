import { Instruction } from './Instruction';

export class AddInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing ADD: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
