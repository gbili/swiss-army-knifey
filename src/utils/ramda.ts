import { composeWith } from "ramda";

export type AnyFunction<A extends any[] = any[], R = any> = (...args: A) => R;

export type ChainFunctionsExtractInputOutput<A extends any[], R> =
  [AnyFunction<any, R>, ...AnyFunction[], AnyFunction<A, any>]
  | [AnyFunction<A, R>];

type UnboxIfArrayOfPromises<T> = T extends Promise<infer U>[] ? Promise<U[]> : T;

export function composeWithPromise<A extends any[], R>(
  ...fns: ChainFunctionsExtractInputOutput<A, R>
): (...args: A) => UnboxIfArrayOfPromises<R> {
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