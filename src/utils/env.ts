export type UnknownEnv = Partial<{ [k: string]: string; }>;

export const envHasKeyGen = (env: any) => (key: string) => {
  return (env[key] || '').length > 0;
}

export function getTypedKey(env: any, keyInEnv: string) {
  if (!envHasKeyGen(env)(keyInEnv)) {
    throw new Error(`Trouble loading process.env.${keyInEnv}`);
  }
  const val: string = env[keyInEnv];
  return val;
}

export const DB_VAR_NAMES = ['DB_HOST', 'DB_USER', 'DB_USER', 'DB_PASSWORD'];

export const envHasKeys = (env: any) => (varNames: string[]) => {
  const envHasKey = envHasKeyGen(env);
  return varNames.filter(envHasKey).length === varNames.length;
}

export const areKeysInEnv = (varNames: string[]) => (env: any) => {
  const envHasKey = envHasKeyGen(env);
  return varNames.filter(envHasKey).length === varNames.length;
}

export const areDBKeysInEnv = areKeysInEnv(DB_VAR_NAMES);