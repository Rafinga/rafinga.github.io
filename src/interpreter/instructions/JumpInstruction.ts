import { Instruction } from './Instruction';
import { LabelInstruction } from './LabelInstruction';
import { Memory } from '../Memory';

export abstract class JumpInstruction extends Instruction {
  protected targetLabel: string;
  protected labelMap: Map<string, LabelInstruction>;
  protected flags: Map<string, boolean>;

  constructor(line: string, memory: Memory, labelMap: Map<string, LabelInstruction>, flags: Map<string, boolean>) {
    super(memory);
    this.labelMap = labelMap;
    this.flags = flags;
    
    // Parse target label
    const parts = line.trim().split(/\s+/);
    this.targetLabel = parts[1];
  }
  
  execute(): void {
    console.log(`Jump instruction looking for label: ${this.targetLabel}`);
    console.log(`Available labels:`, Array.from(this.labelMap.keys()));
    
    if (this.shouldJump()) {
      // Change successor to target label
      const targetInstruction = this.labelMap.get(this.targetLabel);
      if (targetInstruction) {
        this.setSuccessor(targetInstruction);
      } else {
        throw new Error(`Label not found: ${this.targetLabel}`);
      }
    }
    // If shouldJump() returns false, execution continues to normal successor
  }

  abstract shouldJump(): boolean;
  
  toString(): string {
    return `${this.constructor.name} ${this.targetLabel}`;
  }
}
