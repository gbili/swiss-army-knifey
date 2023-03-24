import * as R from "ramda";

export type AnyFunction = (...args: any[]) => unknown;

export type ChainFunctionsExtractInputOutput<A extends any[], R> = [
    (...args: any) => R,
    ...((args: any) => any)[],
    (...args: A) => any
  ]
  | [
    (...args: A) => R
  ];

/**
 * Compose functions that involve Promises. Await for intermediary results,
 * and pass them to the next function, until eventually returns the result.
 *
 * Credit to https://gist.github.com/ehpc/2a524b78729ee6b4e8111f89c66d7ff5
 * for the untyped version.
 *
 * @param fns, set of (possibly async) functions to compose together
 * @returns
 */
export function composeWithPromise<TArgs extends any[], TResult>(
  ...fns: ChainFunctionsExtractInputOutput<TArgs, TResult>
): (...args: TArgs) => TResult {
  const unboxIfLastFn = (f: AnyFunction) => (v: any) => fns[0] === f ? unboxPromisesInArray(f(v)) : f(v);
  const transformer = (f: AnyFunction, val: any) => {
    const wrappedFn = unboxIfLastFn(f);
    if (val && val.then) {
      return val.then(wrappedFn);
    }
    else if (isArrayOfPromises(val)) {
      return Promise.all(val).then(wrappedFn);
    }
    return wrappedFn(val);
  };
  return R.composeWith(transformer, fns);
}

const isArrayOfPromises = function <T>(val: any): val is Promise<T>[] {
  return Boolean(Array.isArray(val) && val.length && val[0] && val[0].then);
}

const unboxPromisesInArray = <T>(val: T) => isArrayOfPromises(val) ? Promise.all(val) : val;