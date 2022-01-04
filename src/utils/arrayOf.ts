export const arrayOf = <T>(value: T) => (length: number): T[] => {
  return Array(length).fill(value);
}