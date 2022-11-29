import { compose } from 'ramda';

export type ExcludeKeysWithValuesOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? never : K
}

export type GetValuesTypes<O> = O[keyof O];

export const stringify = <T>(v: T): string => String(v);

export const excludeKeyWithValuesOfType = <O extends object, T extends 'undefined' | 'object' | 'string' | 'number' | 'boolean'>(o: O, excludeType: T): (keyof ExcludeKeysWithValuesOfType<O, T>)[] => {
  return (Object.keys(o) as (keyof O)[]).filter(k => typeof o[k] !== excludeType);
};

export const serializeAsURIComponents = function <T extends object>(o: T): string {
  return excludeKeyWithValuesOfType(o, 'undefined').map(k => {
    return [k, o[k]].map(compose(encodeURIComponent, stringify)).join('=');
  }).join('&');
};

export default serializeAsURIComponents;