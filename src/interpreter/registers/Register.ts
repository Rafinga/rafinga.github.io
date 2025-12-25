import { RegisterMap } from './RegisterMap';

export class Register {
  public readonly name64: string;
  public readonly name32: string;
  private value: number = 0;

  constructor(registerMap: RegisterMap) {
    const [name64, name32] = registerMap.split(',');
    this.name64 = name64;
    this.name32 = name32;
  }

  getValue(): number {
    return this.value;
  }

  setValue(value: number): void {
    this.value = value;
  }

  toString(): string {
    return `${this.name64}(${this.name32}): ${this.value}`;
  }
}
