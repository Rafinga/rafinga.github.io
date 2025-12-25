import { Instruction } from './Instruction';

export class CallInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing CALL: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
