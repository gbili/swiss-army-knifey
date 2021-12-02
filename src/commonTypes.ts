export type Logger = { log : (...params: any[]) => void, debug : (...params: any[]) => void };
export type CurryFuncWithDepsGen<D, F> = (deps: D) => F;
export type NeedsLogger = { logger: Logger; }