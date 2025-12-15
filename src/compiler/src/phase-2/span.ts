// src/phase-2/span.ts

export class Position {
    constructor(public line: number, public col: number) {}

    toString(): string {
        return `${this.line}:${this.col}`;
    }
}

export class Span {
    constructor(public start: Position, public end: Position) {}

    toString(): string {
        return `${this.start}-${this.end}`;
    }
}

export function span(start?: Position, end?: Position): Span | undefined {
    if (start === undefined || end === undefined) {
        return undefined;
    }
    return new Span(start, end);
}