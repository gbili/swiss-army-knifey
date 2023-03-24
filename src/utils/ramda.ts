import { composeWith } from "ramda";

export type AnyFunction = (...args: any[]) => any;

export type ChainFunctionsExtractInputOutput<A extends any[], R> = [
  (...args: any) => R,
  ...AnyFunction[],
  (...args: A) => any
]
| [
  (...args: A) => R
];

type UnboxArrayOfPromises<T> = T extends Promise<infer U>[] ? Promise<U[]> : T;

export function composeWithPromise<A extends any[], R>(
  ...fns: ChainFunctionsExtractInputOutput<A, R>
): (
  ...args: A
) => UnboxArrayOfPromises<R> {
  const unboxIfLastFn = (f: AnyFunction) => (v: any) => fns[0] === f ? unboxPromisesInArray(f(v)) : f(v);
  const transformer = (f: AnyFunction, val: any) => {
    const wrappedFn = unboxIfLastFn(f);
    if (val && val.then) {
      return val.then(wrappedFn);
    } else if (isArrayOfPromises(val)) {
      return Promise.all(val).then(wrappedFn);
    }
    return wrappedFn(val);
  }
  return composeWith(transformer, fns);
}

const isArrayOfPromises = function <T>(val: any): val is Promise<T>[] {
  return Boolean(Array.isArray(val) && val.length && val[0] && val[0].then);
}

const unboxPromisesInArray = <T>(val: T) => isArrayOfPromises(val) ? Promise.all(val) : val;