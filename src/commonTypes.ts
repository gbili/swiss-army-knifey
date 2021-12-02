export type WithLog = { log : (...params: any[]) => void; }
export type WithDebug = { debug : (...params: any[]) => void; }
export type Logger = {}
  & WithLog
  & WithDebug
export type CurryFuncWithDepsGen<D, F> = (deps: D) => F;
export type NeedsLogger = { logger: Logger; }