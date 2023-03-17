export type ExcludeKeysWithValuesOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? never : K
}

export type GetValuesTypes<O> = O[keyof O];

export const toString = <T>(v: T): string => String(v);

export const excludeKeyWithValuesOfType = <O extends object, T extends 'undefined' | 'object' | 'string' | 'number' | 'boolean'>(o: O, excludeType: T): (keyof ExcludeKeysWithValuesOfType<O, T>)[] => {
  return (Object.keys(o) as (keyof O)[]).filter(k => typeof o[k] !== excludeType);
};

export const isMeantToBeTrue = (v: any) => {
  return typeof v !== 'undefined' && ['true', '1', true, 1, 'yes'].includes(v);
}

export const isMeantToBeFalse = (v: any) => !isMeantToBeTrue(v)

export default toString;