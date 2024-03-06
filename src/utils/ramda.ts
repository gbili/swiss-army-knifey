import { composeWith } from "ramda";

export type AnyFunction<A extends any[] = any[], R = any> = (...args: A) => R;

export type ChainFunctionsExtractInputOutput<A extends any[], R> =
  [AnyFunction<any, R>, ...AnyFunction[], AnyFunction<A, any>]
  | [AnyFunction<A, R>];

export type UnboxIfArrayOfPromises<T> = T extends Promise<infer U>[] ? Promise<U[]> : T;

// Defines a generic function for composing functions with support for promises.
// `A` represents the argument types as a tuple, and `R` represents the return type.
export function composeWithPromise<A extends any[], R>(
  // Uses a rest parameter to accept an array of functions. The function signatures are constrained by `ChainFunctionsExtractInputOutput`.
  ...fns: ChainFunctionsExtractInputOutput<A, R>
): (...args: A) => UnboxIfArrayOfPromises<R> { // Returns a function that takes arguments `A` and returns `R`, possibly unboxed from promises.

  // Defines a function that conditionally unwraps promises in an array if `f` is the first function in the `fns` array.
  // This is specifically used to handle the case where the last executed function (first in the reversed order) returns a promise or an array of promises.
  const unboxIfLastFn = (f: AnyFunction) => (v: any) => fns[0] === f ? unboxPromisesInArray(f(v)) : f(v);

  // A transformer function that applies each function in `fns` to the value, handling promises and arrays of promises.
  const transformer = (f: AnyFunction, val: any) => {
    // Wraps the function to automatically handle promise unboxing if it's the last function.
    const wrappedFn = unboxIfLastFn(f);

    // If `val` is a promise, await it before applying the wrapped function.
    if (val && val.then) {
      return val.then(wrappedFn);
      // If `val` is an array of promises, await all promises in the array before applying the wrapped function.
    } else if (isArrayOfPromises(val)) {
      return Promise.all(val).then(wrappedFn);
    }
    // Otherwise, directly apply the wrapped function to `val`.
    return wrappedFn(val);
  };

  // Returns a composed function that applies `transformer` across all functions in `fns`,
  // effectively chaining them together in a manner that supports asynchronous operations.
  return composeWith(transformer, fns);
}

// Utility type for extracting and merging function parameter types
type AccumulateFunctions<T extends Array<Function>> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => Promise<infer U> | infer U
    ? U & (R extends Array<Function> ? AccumulateFunctions<R> : {})
    : never
  : {};

// The composeAccumulate implementation
export function composeAccumulate<T extends Array<(...args: any[]) => any>>(
  ...fns: T
): (initialArg: Parameters<T[0]>[0]) => Promise<AccumulateFunctions<T>> {
  return async (initialArg) => {
    const accumulate = async (acc: any, func: (...args: any[]) => any) => {
      const result = await func(acc);
      return { ...acc, ...result };
    };

    return fns.reduce(async (prevPromise, currFunc) => {
      return prevPromise.then(acc => accumulate(acc, currFunc));
    }, Promise.resolve(initialArg));
  };
}

const isArrayOfPromises = function <T>(val: any): val is Promise<T>[] {
  return Boolean(Array.isArray(val) && val.length && val[0] && val[0].then);
}

const unboxPromisesInArray = <T>(val: T) => isArrayOfPromises(val) ? Promise.all(val) : val;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type ReturnTypesOfArray<T extends Array<(...args: any) => any>> = {
  [P in keyof T]: UnwrapPromise<ReturnType<T[P]>>;
};

export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type InferCombinedReturnType<T extends Array<(...args: any) => any>> = UnionToIntersection<ReturnTypesOfArray<T>[number]>;

export async function simpleCombineReturns<T extends Array<(arg: U) => any>, U>(
  functionArray: [...T],
  input: U
): Promise<InferCombinedReturnType<T>> {
  const results = await Promise.all(functionArray.map((func) => func(input)));
  return Object.assign({}, ...results);
}

export type SameArgumentType<T> = T extends Array<(arg: infer U) => any> ? U : never;

export function combineReturns<T extends Array<(arg: any) => any>>(
  functionArray: [...T]
): <U extends SameArgumentType<T>>(input: U) => Promise<InferCombinedReturnType<T>> {
  return async <U extends SameArgumentType<T>>(input: U) => {
    const results = await Promise.all(functionArray.map((func) => func(input)));
    return Object.assign({}, ...results) as InferCombinedReturnType<T>;
  };
}