export abstract class Instruction {
  private successor: Instruction | null = null;

  abstract execute(): void;
  abstract toString(): string;

  setSuccessor(successor: Instruction | null): void {
    this.successor = successor;
  }

  getSuccessor(): Instruction | null {
    return this.successor;
  }
}
