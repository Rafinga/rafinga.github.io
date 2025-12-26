import { Instruction } from './Instruction';
import { Memory } from '../Memory';

export abstract class BinaryInstruction extends Instruction {
  protected operandValues: bigint[];
  protected destination: string;
  protected isLong: boolean;

  constructor(line: string, memory: Memory) {
    super(memory);
    const { operands, isLong } = this.parseInstruction(line);
    this.isLong = isLong;
    
    const size = isLong ? 8 : 4;
    this.operandValues = operands.map(op => this.memory.read(op, size));
    this.destination = operands[operands.length - 1]; // Last operand is destination
    
    // Execute and write result automatically
    const result = this.executeOperation();
    this.writeResult(result);
  }

  abstract executeOperation(): bigint;
  
  execute(): void {
    // Already executed in constructor
  }

  protected writeResult(value: bigint): void {
    const size = this.isLong ? 8 : 4;
    this.memory.write(this.destination, value, size);
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
