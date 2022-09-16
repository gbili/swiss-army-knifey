function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return typeof obj === 'object' && obj.hasOwnProperty(prop);
}

function hasKey<X extends {}, Y extends PropertyKey>(env: X, key: Y): env is X & Record<Y, string> {
  return hasOwnProperty(env, key) && typeof env[key] === 'string';
}

export const hasKeyOrThrow = <X extends {}, Y extends PropertyKey>(env: X, key: Y, message?: string): true | never => {
  getKeyOrThrow(env, key, message);
  return true;
}

export const getKeyOrThrow = <X extends {}, Y extends PropertyKey>(env: X, key: Y, message?: string): string => {
  if (!hasKey(env, key) || env[key].length <= 0) {
    throw new Error(message ? `Missing .env key ${String(key)}. ${message}` : `Cannot operate without ${String(key)}, add it to .env file`);
  }
  return env[key];
}

export default getKeyOrThrow;