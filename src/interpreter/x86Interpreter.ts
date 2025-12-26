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
import { Memory } from './Memory';

class X86Interpreter {
  private instructions: Instruction[];
  private currentInstruction: Instruction | null = null;
  private memory: Memory;

  constructor() {
    this.instructions = [];
    this.currentInstruction = null;
    this.memory = new Memory();
  }

  private parseInstructions(assembly: string): void {
    this.instructions= assembly.split('\n')
      .map(line => line.trim())
      .filter(line => {
        return line && 
               !line.includes(':') && 
               !line.startsWith('.') && 
               !line.includes('.string');
      }).map(line => this.parseInstruction(line));
    
    // Link instructions with successors
    for (let i = 0; i < this.instructions.length - 1; i++) {
      this.instructions[i].setSuccessor(this.instructions[i + 1]);
    }
  }

  public execute(assembly: string): string {
    console.log('Starting execution...');
    
    this.parseInstructions(assembly);
    
    console.log(`Found ${this.instructions.length} instructions`);
    console.log('Execution complete');
    
    // Print memory state
    this.printMemoryState();
    
    return "Program executed (logging to console)";
  }

  private printMemoryState(): void {
    console.log('\n=== MEMORY STATE ===');
    console.log('Registers:');
    const registers = this.memory['registers'].getAllRegisters();
    registers.forEach(reg => {
      if (reg.getValue() !== 0) {
        console.log(`  ${reg.toString()}`);
      }
    });
    
    console.log('Stack Memory:');
    const stackMemory = this.memory['stack']['memory'];
    if (stackMemory.size === 0) {
      console.log('  (empty)');
    } else {
      stackMemory.forEach((value, address) => {
        console.log(`  0x${address.toString(16)}: ${value}`);
      });
    }
  }

  private parseInstruction(line: string): Instruction {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.startsWith('mov')) {
      return new MovInstruction(line, this.memory);
    } else if (trimmed.startsWith('add')) {
      return new AddInstruction(line, this.memory);
    } else if (trimmed.startsWith('sub')) {
      return new SubInstruction(line, this.memory);
    } else if (trimmed.startsWith('mul') || trimmed.startsWith('imul')) {
      return new MulInstruction(line, this.memory);
    } else if (trimmed.startsWith('div') || trimmed.startsWith('idiv')) {
      return new DivInstruction(line, this.memory);
    } else if (trimmed.startsWith('and')) {
      return new AndInstruction(line, this.memory);
    } else if (trimmed.startsWith('or')) {
      return new OrInstruction(line, this.memory);
    } else if (trimmed.startsWith('call')) {
      return new CallInstruction(line, this.memory);
    } else {
      // Treat pop, push, ret, xor, etc. as unknown for now
      return new UnknownInstruction(line, this.memory);
    }
  }
}

export default X86Interpreter;
