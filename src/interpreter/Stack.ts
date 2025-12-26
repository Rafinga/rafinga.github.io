export class Stack {
  private memory: Map<bigint, bigint> = new Map();

  private write(address: bigint, value: bigint, size: number): void {
    const alignedAddr = address & ~0x7n; // Clear last 3 bits
    const offset = Number(address & 0x7n); // Get offset within 8-byte block
    
    if (offset + size <= 8) {
      // Fits in single block
      const existing = this.memory.get(alignedAddr) || 0n;
      const mask = (1n << BigInt(size * 8)) - 1n;
      const shiftedValue = (value & mask) << BigInt(offset * 8);
      const clearMask = ~(mask << BigInt(offset * 8));
      this.memory.set(alignedAddr, (existing & clearMask) | shiftedValue);
    } else {
      // Spans multiple blocks
      const firstSize = 8 - offset;
      const secondSize = size - firstSize;
      
      this.write(address, value & ((1n << BigInt(firstSize * 8)) - 1n), firstSize);
      this.write(alignedAddr + 8n, value >> BigInt(firstSize * 8), secondSize);
    }
  }

  private read(address: bigint, size: number): bigint {
    const alignedAddr = address & ~0x7n;
    const offset = Number(address & 0x7n);
    
    if (offset + size <= 8) {
      // Fits in single block
      const block = this.memory.get(alignedAddr) || 0n;
      const mask = (1n << BigInt(size * 8)) - 1n;
      return (block >> BigInt(offset * 8)) & mask;
    } else {
      // Spans multiple blocks
      const firstSize = 8 - offset;
      const secondSize = size - firstSize;
      
      const firstPart = this.read(address, firstSize);
      const secondPart = this.read(alignedAddr + 8n, secondSize);
      return firstPart | (secondPart << BigInt(firstSize * 8));
    }
  }

  public writeMemory(address: bigint, value: bigint, size: 4 | 8): void {
    this.write(address, value, size);
  }

  public readMemory(address: bigint, size: 4 | 8): bigint {
    return this.read(address, size);
  }
}
