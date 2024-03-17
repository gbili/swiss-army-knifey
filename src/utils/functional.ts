// A helper function for better output of values
export abstract class Either<L, R> {
  protected constructor(private $value: L | R) {}

  static of<L, R>(x: R): Either<L, R> {
    return new Right<L, R>(x);
  }

  abstract map<T>(f: (x: R) => T): Either<L, T>;
  abstract inspect(): string;

  protectedAccess() {
    return this.$value;
  }
}

export class Left<L, R> extends Either<L, R> {
  constructor(x: L) {
    super(x);
  }

  map<T>(_: (x: R) => T): Either<L, T> {
    return this as unknown as Either<L, T>; // Type is preserved as Left
  }

  inspect(): string {
    return `Left(${inspect(this.protectedAccess())})`;
  }
}

export class Right<L, R> extends Either<L, R> {
  constructor(x: R) {
    super(x);
  }

  map<T>(f: (x: R) => T): Either<L, T> {
    return Either.of<L, T>(f(this.protectedAccess() as R));
  }

  inspect(): string {
    return `Right(${inspect(this.protectedAccess())})`;
  }
}

export function inspect(x: any): string {
  return typeof x === 'string' ? `"${x}"` : String(x);
}

export const either = <L>(l: (...args: any[]) => Left<L, any>) => <R>(r: (...args: any[]) => Either<L, R>) => (e: Either<L, R>) => {
  switch (e.constructor) {
      case Left:
          return l(e.protectedAccess());
      case Right:
          return r(e.protectedAccess());
      default:
          return l("Unsupported value v passed to either(l,r,v)");
  }
};
