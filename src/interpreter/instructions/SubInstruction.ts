import { Instruction } from './Instruction';

export class SubInstruction extends Instruction {
  constructor(private line: string) {
    super();
  }
  
  execute(): void {
    console.log(`Executing SUB: ${this.line}`);
  }
  
  toString(): string {
    return this.line;
  }
}
