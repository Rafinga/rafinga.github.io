export abstract class Datatype {
  abstract equals(other: Datatype): boolean;
  abstract toString(): string;
}

export class InvalidType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    return false;
  }
  toString(): string {
    return "invalid";
  }
}

export class IntType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    // Allow IntType to be equal to both IntType and LongType (parent-child logic)
    return other instanceof IntType;
  }
  toString(): string {
    return "int";
  }
}

export class LongType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    // Allow LongType to be equal to both LongType and IntType (parent-child logic)
    return other instanceof LongType;
  }
  toString(): string {
    return "long";
  }
}

export class BoolType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    return other instanceof BoolType;
  }
  toString(): string {
    return "bool";
  }
}

export class CharType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    return other instanceof CharType;
  }
  toString(): string {
    return "char";
  }
}

export class ArrayType extends Datatype {
  constructor(public array_size: number) {
    super();
  }
  equals(other: Datatype): boolean {
    return other instanceof ArrayType;
  }
  toString(): string {
    return `array[${this.array_size}]`;
  }
}

export class IntArrayType extends ArrayType {
  constructor(public array_size: number) {
    super(array_size);
  }
  equals(other: Datatype): boolean {
    return other instanceof IntArrayType;
  }
  unarray(): Datatype {
    return new IntType();
  }
  toString(): string {
    return `int[${this.array_size}]`;
  }
}

export class LongArrayType extends ArrayType {
  constructor(public array_size: number) {
    super(array_size);
  }
  equals(other: Datatype): boolean {
    return other instanceof LongArrayType;
  }
  unarray(): Datatype {
    return new LongType();
  }
  toString(): string {
    return `long[${this.array_size}]`;
  }
}

export class BoolArrayType extends ArrayType {
  constructor(public array_size: number) {
    super(array_size);
  }
  equals(other: Datatype): boolean {
    return other instanceof BoolArrayType;
  }
  unarray(): Datatype {
    return new BoolType();
  }
  toString(): string {
    return `bool[${this.array_size}]`;
  }
}

export class StringType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    return other instanceof StringType;
  }
  toString(): string {
    return "string";
  }
}

export class VoidType extends Datatype {
  constructor() {
    super();
  }
  equals(other: Datatype): boolean {
    return other instanceof VoidType;
  }
  toString(): string {
    return "void";
  }
}
