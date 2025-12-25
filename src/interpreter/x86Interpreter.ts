import { Instruction } from './instructions/Instruction';
import { MovInstruction } from './instructions/MovInstruction';
import { AddInstruction } from './instructions/AddInstruction';
import { SubInstruction } from './instructions/SubInstruction';
import { MulInstruction } from './instructions/MulInstruction';
import { DivInstruction } from './instructions/DivInstruction';
import { AndInstruction } from './instructions/AndInstruction';
import { OrInstruction } from './instructions/OrInstruction';
import { CallInstruction } from './instructions/CallInstruction';
import { UnknownInstruction } from './instructions/UnknownInstruction';

class X86Interpreter {
  private instructions: Instruction[];
  private currentInstruction: Instruction | null = null;

  constructor() {
    this.instructions = [];
    this.currentInstruction = null;
  }

  private parseInstructions(assembly: string): void {
    const lines = assembly.split('\n')
      .map(line => line.trim())
      .filter(line => {
        return line && 
               !line.includes(':') && 
               !line.startsWith('.') && 
               !line.includes('.string');
      });
    
    this.instructions = lines.map(line => this.parseInstruction(line));
    
    // Link instructions with successors
    for (let i = 0; i < this.instructions.length - 1; i++) {
      this.instructions[i].setSuccessor(this.instructions[i + 1]);
    }
    // Last instruction has no successor
    if (this.instructions.length > 0) {
      this.instructions[this.instructions.length - 1].setSuccessor(null);
    }
  }

  public execute(assembly: string): string {
    console.log('Starting execution...');
    
    this.parseInstructions(assembly);
    
    // Start with first instruction
    this.currentInstruction = this.instructions.length > 0 ? this.instructions[0] : null;
    
    console.log(`Found ${this.instructions.length} instructions`);
    
    // Execute until no more instructions
    while (this.currentInstruction !== null) {
      this.currentInstruction.execute();
      this.currentInstruction = this.currentInstruction.getSuccessor();
    }
    
    console.log('Execution complete');
    return "Program executed (logging to console)";
  }

  private parseInstruction(line: string): Instruction {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.startsWith('mov')) {
      return new MovInstruction(line);
    } else if (trimmed.startsWith('add')) {
      return new AddInstruction(line);
    } else if (trimmed.startsWith('sub')) {
      return new SubInstruction(line);
    } else if (trimmed.startsWith('mul') || trimmed.startsWith('imul')) {
      return new MulInstruction(line);
    } else if (trimmed.startsWith('div') || trimmed.startsWith('idiv')) {
      return new DivInstruction(line);
    } else if (trimmed.startsWith('and')) {
      return new AndInstruction(line);
    } else if (trimmed.startsWith('or')) {
      return new OrInstruction(line);
    } else if (trimmed.startsWith('call')) {
      return new CallInstruction(line);
    } else {
      return new UnknownInstruction(line);
    }
  }
}

export default X86Interpreter;
