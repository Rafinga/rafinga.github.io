import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export abstract class BinaryInstruction extends Instruction {
  protected operandValues: bigint[] = [];
  protected destination: string = '';
  protected isLong: boolean = false;
  private operands: string[] = [];

  constructor(line: string, memory: Memory) {
    super(memory);
    const { operands, isLong } = this.parseInstruction(line);
    this.operands = operands;
    this.isLong = isLong;
    this.destination = operands[operands.length - 1]; // Last operand is destination
  }

  abstract executeOperation(): bigint;
  
  execute(): void {
    // Read operand values at execution time
    const size = this.isLong ? 8 : 4;
    this.operandValues = this.operands.map(op => this.memory.read(op, size));
    
    // Execute operation and write result
    const result = this.executeOperation();
    this.writeResult(result);
  }

  private parseInstruction(line: string): { operands: string[], isLong: boolean } {
    const parts = line.trim().split(/\s+/);
    const instruction = parts[0];
    
    const isLong = instruction.endsWith('q');
    
    if (parts.length < 2) {
      return { operands: [], isLong };
    }
    
    // Join all parts after instruction, then split by comma
    const operandStr = parts.slice(1).join(' ');
    const operands = operandStr.split(',').map(op => op.trim());
    
    return { operands, isLong };
  }
}
