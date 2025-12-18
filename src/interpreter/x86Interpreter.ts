interface Registers {
  [key: string]: number;
}

class X86Interpreter {
  private registers: Registers;
  private memory: { [address: number]: number };
  private strings: { [key: string]: string };
  private output: string;
  private stack: number[];
  private rbp: number;

  constructor() {
    this.registers = { rax: 0, rbx: 0, rcx: 0, rdx: 0, rsi: 0, rdi: 0, r8: 0, r9: 0, r10: 0, r11: 0, r12: 0 };
    this.memory = {};
    this.strings = {};
    this.output = "";
    this.stack = [];
    this.rbp = 1000; // Base pointer
  }

  private getRegisterValue(reg: string): number {
    const regMap: { [key: string]: string } = {
      'eax': 'rax', 'ebx': 'rbx', 'ecx': 'rcx', 'edx': 'rdx',
      'esi': 'rsi', 'edi': 'rdi', 'r8d': 'r8', 'r9d': 'r9',
      'r10d': 'r10', 'r11d': 'r11', 'r12d': 'r12'
    };
    const actualReg = regMap[reg] || reg;
    return this.registers[actualReg] || 0;
  }

  private setRegisterValue(reg: string, value: number): void {
    const regMap: { [key: string]: string } = {
      'eax': 'rax', 'ebx': 'rbx', 'ecx': 'rcx', 'edx': 'rdx',
      'esi': 'rsi', 'edi': 'rdi', 'r8d': 'r8', 'r9d': 'r9',
      'r10d': 'r10', 'r11d': 'r11', 'r12d': 'r12'
    };
    const actualReg = regMap[reg] || reg;
    this.registers[actualReg] = value;
  }

  private extractStringLiterals(assembly: string): void {
    const stringMatches = assembly.match(/string_literal_\d+:\s*\.string\s*"([^"]+)"/g);
    if (stringMatches) {
      stringMatches.forEach(match => {
        const labelMatch = match.match(/string_literal_(\d+):\s*\.string\s*"([^"]+)"/);
        if (labelMatch) {
          this.strings[`string_literal_${labelMatch[1]}`] = labelMatch[2];
        }
      });
    }
  }

  private processInstruction(instruction: string): void {
    const trimmed = instruction.trim();
    
    // LEA for string literals
    const leaStringMatch = trimmed.match(/lea\s+(string_literal_\d+)\(%rip\),\s*%(\w+)/);
    if (leaStringMatch) {
      this.registers.rdi = this.strings[leaStringMatch[1]] || leaStringMatch[1];
      return;
    }

    // LEA for array access
    const leaArrayMatch = trimmed.match(/lea\s+(-?\d+)\(%rbp,%(\w+),(\d+)\),\s*%(\w+)/);
    if (leaArrayMatch) {
      const offset = parseInt(leaArrayMatch[1]);
      const indexValue = this.getRegisterValue(leaArrayMatch[2]);
      const scale = parseInt(leaArrayMatch[3]);
      const address = this.rbp + offset + (indexValue * scale);
      this.setRegisterValue(leaArrayMatch[4], address);
      return;
    }

    // MOV immediate to register
    const movImmMatch = trimmed.match(/movl\s+\$(\d+),\s*%(\w+)/);
    if (movImmMatch) {
      this.setRegisterValue(movImmMatch[2], parseInt(movImmMatch[1]));
      return;
    }

    // MOV register to register
    const movRegMatch = trimmed.match(/movl\s+%(\w+),\s*%(\w+)/);
    if (movRegMatch) {
      this.setRegisterValue(movRegMatch[2], this.getRegisterValue(movRegMatch[1]));
      return;
    }

    // MOV register to stack: movl %r11d, -12(%rbp)
    const movRegToStackMatch = trimmed.match(/movl\s+%(\w+),\s*(-?\d+)\(%rbp\)/);
    if (movRegToStackMatch) {
      const value = this.getRegisterValue(movRegToStackMatch[1]);
      const offset = parseInt(movRegToStackMatch[2]);
      const address = this.rbp + offset;
      this.memory[address] = value;
      return;
    }

    // MOV stack to register: movl -12(%rbp), %eax
    const movStackToRegMatch = trimmed.match(/movl\s+(-?\d+)\(%rbp\),\s*%(\w+)/);
    if (movStackToRegMatch) {
      const offset = parseInt(movStackToRegMatch[1]);
      const address = this.rbp + offset;
      const value = this.memory[address] || 0;
      this.setRegisterValue(movStackToRegMatch[2], value);
      return;
    }

    // MOV memory to register: movl (%rax), %eax
    const movMemToRegMatch = trimmed.match(/movl\s+\(%(\w+)\),\s*%(\w+)/);
    if (movMemToRegMatch) {
      const address = this.getRegisterValue(movMemToRegMatch[1]);
      const value = this.memory[address] || 0;
      this.setRegisterValue(movMemToRegMatch[2], value);
      return;
    }

    // MOV register to memory: movl %eax, (%rax)
    const movRegToMemMatch = trimmed.match(/movl\s+%(\w+),\s*\(%(\w+)\)/);
    if (movRegToMemMatch) {
      const value = this.getRegisterValue(movRegToMemMatch[1]);
      const address = this.getRegisterValue(movRegToMemMatch[2]);
      this.memory[address] = value;
      return;
    }

    // XOR register (set to 0)
    const xorMatch = trimmed.match(/xorl\s+%(\w+),\s*%(\w+)/);
    if (xorMatch && xorMatch[1] === xorMatch[2]) {
      this.setRegisterValue(xorMatch[1], 0);
      return;
    }

    // ADD
    const addMatch = trimmed.match(/addl\s+%(\w+),\s*%(\w+)/);
    if (addMatch) {
      const val1 = this.getRegisterValue(addMatch[1]);
      const val2 = this.getRegisterValue(addMatch[2]);
      this.setRegisterValue(addMatch[2], val1 + val2);
      return;
    }

    // PRINTF call
    if (trimmed === 'call printf') {
      this.handlePrintf();
    }
  }

  private handlePrintf(): void {
    const formatStr = this.registers.rdi;
    if (typeof formatStr === 'string') {
      let output = formatStr;
      const args = [this.registers.rsi, this.registers.rdx, this.registers.rcx, this.registers.r8, this.registers.r9];
      
      let argIndex = 0;
      output = output.replace(/%d/g, () => {
        return argIndex < args.length ? args[argIndex++].toString() : '%d';
      });
      
      output = output.replace(/\\n/g, '\n');
      this.output += output;
    }
  }

  public execute(assembly: string): string {
    this.output = "";
    this.registers = { rax: 0, rbx: 0, rcx: 0, rdx: 0, rsi: 0, rdi: 0, r8: 0, r9: 0, r10: 0, r11: 0, r12: 0 };
    this.memory = {};
    this.strings = {};
    
    this.extractStringLiterals(assembly);
    
    const lines = assembly.split('\n').filter(line => line.trim() && !line.includes(':') && !line.startsWith('.'));
    for (const line of lines) {
      this.processInstruction(line);
    }
    
    return this.output || "Program executed (no output generated)";
  }
}

export default X86Interpreter;
