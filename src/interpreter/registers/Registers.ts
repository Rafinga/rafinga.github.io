import { Register } from './Register';
import { RegisterMap } from './RegisterMap';

export class Registers {
  private registers: Map<string, Register> = new Map();

  constructor() {
    // Initialize all registers from the enum
    Object.values(RegisterMap).forEach(regMap => {
      const register = new Register(regMap);
      // Map both 64-bit and 32-bit names to the same register instance
      this.registers.set(register.name64, register);
      this.registers.set(register.name32, register);
    });
  }

  getRegister(name: string): Register | undefined {
    // Remove % prefix if present
    const cleanName = name.startsWith('%') ? name.slice(1) : name;
    return this.registers.get(cleanName);
  }

  getValue(name: string): number {
    const register = this.getRegister(name);
    return register ? register.getValue() : 0;
  }

  setValue(name: string, value: number): void {
    const register = this.getRegister(name);
    if (register) {
      register.setValue(value);
    }
  }

  getAllRegisters(): Register[] {
    // Return unique register instances (avoid duplicates from 32/64 bit mapping)
    const uniqueRegisters = new Set<Register>();
    this.registers.forEach(reg => uniqueRegisters.add(reg));
    return Array.from(uniqueRegisters);
  }
}
