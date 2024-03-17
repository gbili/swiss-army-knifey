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

type IsAnyAsyncFunction<T extends Array<Function>> = T extends [infer F, ...infer Rest]
  ? F extends (...args: any[]) => Promise<any>
    ? true
    : IsAnyAsyncFunction<Rest extends Array<Function> ? Rest : []>
  : false;

type UnboxPromise<T> = T extends Promise<infer U> ? U : T;
type IsPromise<T> = T extends Promise<any> ? true : false;

const accumulateAsync = async (acc: any, result: Promise<any>) => {
  const awaitedResult = await result;
  if (awaitedResult === undefined || awaitedResult === null) {
    return undefined;
  }
  return ({ ...acc, ...awaitedResult })
};

const accumulate = (acc: any, result: any) => {
  if (result === undefined || result === null) {
    return undefined;
  }
  return ({ ...acc, ...result })
};

function accumulateGate(acc: any, result: any) {
  if (result && result.then) {
    return accumulateAsync(acc, result);
  }
  return accumulate(acc, result);
}

export function composeAccumulate<T extends Array<(...args: any[]) => any>>(
  ...fns: T
) {
  type ResultType = IsPromise<Parameters<T[0]>[0]> extends true ? Promise<UnboxPromise<Parameters<T[0]>[0]> & AccumulateFunctions<T>> : (UnboxPromise<Parameters<T[0]>[0]> & AccumulateFunctions<T>);
  type IsAsync = IsAnyAsyncFunction<T> extends true ? true : (IsPromise<Parameters<T[0]>[0]> extends true ? true : false);

  const accumulator = (initialArg: Parameters<T[0]>[0]): IsAsync extends true ? Promise<ResultType> : ResultType => {
    return fns.reduce((acc: any, currFunc) => {
      if (acc === undefined) {
        return undefined;
      }
      if (acc && acc.then) {
        const afterThen = acc.then(async (a: any) => {
          if (a === undefined) return undefined;
          return await accumulateGate(a, currFunc(a))
        });
        return afterThen;
      }
      return accumulateGate(acc, currFunc(acc));
    }, initialArg);
  };

  return accumulator as IsAsync extends true
    ? (initialArg: Parameters<T[0]>[0]) => Promise<ResultType>
    : (initialArg: Parameters<T[0]>[0]) => ResultType;
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