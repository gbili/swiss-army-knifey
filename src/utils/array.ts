export const arrayOf = <T>(value: T) => (length: number): T[] => {
  return Array(length).fill(value);
}
export const arrayUnique = <T>(values: T[]) => values.reduce((p: T[], c: T) => p.indexOf(c) === -1 ? [...p, c] : p, []);

export const forEachSeries = async <A, C extends (item: A, index: number|string, array: A[]) => any>(arr: A[], callback: C): Promise<void> => {
  for (const k in arr) {
    await callback(arr[k], k, arr)
  }
}

export type ReducerWithBrakeCallback<U, T> = (acc: U, curr: T) => U;
export type ShouldBreakCallback<U, T> = (acc: U, curr: T) => boolean;

export async function reduceWithBreak<T, U>(arr: T[], reducer: (acc: U, curr: T) => Promise<U>, shouldBreak: (acc: U, curr: T) => boolean, initialValue: U) {
  let result = initialValue;
  for (const item of arr) {
    if (shouldBreak(result, item)) break;
    result = await reducer(result, item);
  }
  return result;
}

export function reduceWithBreakSync<T, U>(arr: T[], reducer: (acc: U, curr: T) => U, shouldBreak: (acc: U, curr: T) => boolean, initialValue: U) {
  let result = initialValue;
  for (const item of arr) {
    if (shouldBreak(result, item)) break;
    result = reducer(result, item);
  }
  return result;
}

export type UnpackPromise<T> = T extends Promise<infer Z> ? Z : T;

export const mapSeries = async <A, C extends (item: A, index: number|string, array: A[]) => any>(arr: A[], callback: C): Promise<UnpackPromise<ReturnType<C>>[]> => {
  let mapped: UnpackPromise<ReturnType<C>>[] = [];
  for (const k in arr) {
    mapped.push(await callback(arr[k], k, arr))
  }
  return mapped;
}

export const unmerge = function <E, C extends (item: E, index: number|string, array: E[]) => boolean>(a: E[], callback: C) {
  return a.reduce((p: [E[], E[]], c, i): [E[], E[]] => {
    return callback(c, i, a)
      ? [[...p[0], c], [...p[1]]]
      : [[...p[0]], [...p[1], c]]
  }, [[], []]);
}

export function getArrayFromZeroOfLengthN(n: number) {
  return Array.from(Array(n).keys());
}

export function getArrayRange(start: number, end: number) {
  const endPlus1 = end + 1;
  return getArrayFromZeroOfLengthN(endPlus1 - start).map(num => num + start);
}

export function group<T>(array: T[], lense: (el: T) => string) {
  return array.reduce((p, c) => {
    const k = lense(c);
    return {
      ...p,
      [k]: p[k] ? [...p[k], c] : [c],
    };
  }, {} as { [k: string]: T[] });
}