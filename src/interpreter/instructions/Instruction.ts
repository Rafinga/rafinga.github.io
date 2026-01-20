import { Memory } from '../Memory';

export abstract class Instruction {
  private successor: Instruction | null = null;
  protected memory: Memory;
  protected isLong = true;
  protected destination = 'fake register';

  constructor(memory: Memory) {
    this.memory = memory;
  }

  abstract execute(): void;
  abstract toString(): string;

  setSuccessor(successor: Instruction | null): void {
    this.successor = successor;
  }

  getSuccessor(): Instruction | null {
    return this.successor;
  }
  protected writeResult(value: bigint): void {
    const size = this.isLong ? 8 : 4;
    this.memory.write(this.destination, value, size);
  }
  
}
