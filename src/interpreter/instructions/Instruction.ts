import { Memory } from '../Memory';

export abstract class Instruction {
  private successor: Instruction | null = null;
  protected memory: Memory;

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
}
