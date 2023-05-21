export type UnknownEnv = Partial<{ [k: string]: string; }>;

export const envHasKeyGen = (env: any) => (key: string) => {
  return (env[key] || '').length > 0;
}

export function getFormatedKey(env: any, keyInEnv: string, name: string) {
  if (!envHasKeyGen(env)(keyInEnv)) {
    throw new Error(`Trouble loading process.env.${keyInEnv}`);
  }
  let val: string = env[keyInEnv];
  return val;
}

export const DB_VAR_NAMES = ['DB_HOST', 'DB_USER', 'DB_USER', 'DB_PASSWORD'];

export const envHasVars = (env: any) => (varNames: string[]) => {
  const envHasKey = envHasKeyGen(env);
  return varNames.filter(envHasKey).length === varNames.length;
}

export const areVarsInEnv = (varNames: string[]) => (env: any) => {
  const envHasKey = envHasKeyGen(env);
  return varNames.filter(envHasKey).length === varNames.length;
}

export const areDBVarsInEnv = areVarsInEnv(DB_VAR_NAMES);