import { UnpackPromise } from "./array";

export const entriesMap = async <O extends { [K in keyof O]: any; }, C extends (item: O extends { [K in keyof O]: infer V; } ? V : never, key: keyof O, entries: [keyof O, O extends { [K in keyof O]: infer V; } ? V : never][]) => any>(obj: O, callback: C): Promise<{ [K in keyof O]: UnpackPromise<ReturnType<C>>; }> => {
  type V = O extends { [K in keyof O]: infer V; } ? V : never;
  const entries: [keyof O, V][] = Object.entries(obj) as [keyof O, V][];
  const ret = {} as { [K in keyof O]: UnpackPromise<ReturnType<C>>; };
  for (const k in entries) {
    const [key, value] = entries[k];
    ret[key] = await callback(value, key, entries);
  }
  return ret;
}