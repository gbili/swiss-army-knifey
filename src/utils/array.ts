export const arrayOf = <T>(value: T) => (length: number): T[] => {
  return Array(length).fill(value);
}
export const arrayUnique = <T>(values: T[]) => values.reduce((p: T[], c: T) => p.indexOf(c) === -1 ? [...p, c] : p, []);