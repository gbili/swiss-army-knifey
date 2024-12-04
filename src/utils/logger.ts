import { dateToString } from "./uncategorized";

export interface LoggerEnvironment {
  LOGGER_DEBUG: boolean;
  LOGGER_LOG: boolean;
}

export interface Logger {
  log(message: string, ...meta: unknown[]): void;
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

const devNull = (..._: unknown[]): void => undefined;

const getTimestamp = (): string => `[${dateToString(new Date())}]`;

export const createLogger = (
  env: LoggerEnvironment = { LOGGER_DEBUG: true, LOGGER_LOG: true }
): Logger => ({
  log: env.LOGGER_LOG
    ? (message: string, ...meta: unknown[]) => console.log(getTimestamp(), '[LOG]', message, ...meta)
    : devNull,
  debug: env.LOGGER_DEBUG
    ? (message: string, ...meta: unknown[]) => console.log(getTimestamp(), '[DEBUG]', message, ...meta)
    : devNull,
  info: env.LOGGER_DEBUG
    ? (message: string, ...meta: unknown[]) => console.log(getTimestamp(), '[INFO]', message, ...meta)
    : devNull,
  warn: env.LOGGER_LOG
    ? (message: string, ...meta: unknown[]) => console.warn(getTimestamp(), '[WARN]', message, ...meta)
    : devNull,
  error: env.LOGGER_LOG
    ? (message: string, ...meta: unknown[]) => console.error(getTimestamp(), '[ERROR]', message, ...meta)
    : devNull,
});

export const loggerGen = createLogger;

export const chattyLogger = createLogger({ LOGGER_DEBUG: true, LOGGER_LOG: true });
export const logger = createLogger({ LOGGER_DEBUG: false, LOGGER_LOG: true });
export const silentLogger = createLogger({ LOGGER_DEBUG: false, LOGGER_LOG: false });

export default chattyLogger;