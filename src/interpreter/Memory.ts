import { Registers } from './registers/Registers';
import { Stack } from './Stack';

export class Memory {
  private registers: Registers;
  private stack: Stack;

  constructor() {
    this.registers = new Registers();
    this.stack = new Stack();
  }

  read(addr: string, length: 4 | 8): bigint {
    if (this.isImmediate(addr)) {
      return this.parseImmediate(addr);
    }
    
    if (this.isRegister(addr)) {
      return BigInt(this.registers.getValue(addr));
    }
    
    const memAddr = this.parseMemoryAddress(addr);
    return this.stack.readMemory(memAddr, length);
  }

  write(addr: string, val: bigint, length: 4 | 8): void {
    if (this.isRegister(addr)) {
      this.registers.setValue(addr, Number(val));
      return;
    }
    
    const memAddr = this.parseMemoryAddress(addr);
    this.stack.writeMemory(memAddr, val, length);
  }

  private isRegister(addr: string): boolean {
    return !addr.includes('(') && !addr.startsWith('$');
  }

  private isImmediate(addr: string): boolean {
    return addr.startsWith('$');
  }

  private parseImmediate(addr: string): bigint {
    return BigInt(parseInt(addr.slice(1)));
  }

  private parseMemoryAddress(addr: string): bigint {
    // Handle format: offset(reg) or (reg)
    const match = addr.match(/^([^(]*)\(([^)]+)\)$/);
    if (!match) throw new Error(`Invalid memory address format: ${addr}`);
    
    const [, offsetStr, regStr] = match;
    const baseAddr = BigInt(this.registers.getValue(regStr));
    const offsetVal = offsetStr ? BigInt(parseInt(offsetStr)) : 0n;
    
    return baseAddr + offsetVal;
  }
}
