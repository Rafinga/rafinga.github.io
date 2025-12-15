import { Span } from "../span";
import { Datatype } from "./datatype";
import { Field } from "./ir";

export class Scope {
  parent: Scope | null;
  symbols: Map<string, Field>;

  constructor(parent: Scope | null) {
    this.parent = parent;
    this.symbols = new Map();
  }

  add(id: string, type: Field): void {
    if (this.symbols.has(id)) {
      throw new Error(`Duplicate variable: ${id}`);
    }
    this.symbols.set(id, type);
  }

  lookup(id: string): Datatype | undefined {
    if (this.symbols.has(id)) {
      return this.symbols.get(id)?.type as Datatype;
    } else if (this.parent !== null) {
      return this.parent.lookup(id) as Datatype;
    } else {
      return undefined;
    }
  }
}

export class Params extends Scope {
  public ordered_params: Array<[string, Field]> = [];
  constructor(ordered_params: Array<[string, Datatype, Span]>, parent: Scope) {
    super(parent);
    ordered_params.forEach((param) =>
      this.add(param[0], new Field(param[0], param[1], param[2]))
    );
  }
  add(param: string, type: Field): void {
    this.symbols.set(param, type);
    this.ordered_params.push([param, type]);
  }
}
