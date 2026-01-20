import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export class LabelInstruction extends Instruction {
  public readonly labelName: string;

  constructor(line: string, memory: Memory) {
    super(memory);
    
    // Parse label name (remove colon)
    this.labelName = line.trim().replace(':', '');
  }
  
  execute(): void {
    // Labels do nothing during execution
  }
  
  toString(): string {
    return `LABEL: ${this.labelName}`;
  }
}
