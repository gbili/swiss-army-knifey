export const arrayOf = <T>(value: T) => (length: number): T[] => {
  return Array(length).fill(value);
}
export const arrayUnique = <T>(values: T[]) => values.reduce((p: T[], c: T) => p.indexOf(c) === -1 ? [...p, c] : p, []);

export const forEachSeries = async <A, C extends (item: A, index: number|string, array: A[]) => any>(arr: A[], callback: C): Promise<void> => {
  for (const k in arr) {
    await callback(arr[k], k, arr)
  }
}

export const mapSeries = async <A, C extends (item: A, index: number|string, array: A[]) => any>(arr: A[], callback: C): Promise<ReturnType<C>[]> => {
  let mapped: ReturnType<C>[] = [];
  for (const k in arr) {
    mapped.push(await callback(arr[k], k, arr))
  }
  return mapped;
}