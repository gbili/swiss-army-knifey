import { Logger as L } from "saylo";
export type WithLog = { log : (...params: any[]) => void; }
export type WithDebug = { debug : (...params: any[]) => void; }
export type CurryFuncWithDepsGen<D, F> = (deps: D) => F;
export type Logger = Pick<L, "log" | "debug">;
export type NeedsLogger = { logger: Logger; }