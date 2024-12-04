import { dateToString } from "./uncategorized";

export interface LoggerEnvironment {
  LOGGER_DEBUG: boolean;
  LOGGER_LOG: boolean;
}

export interface Logger {
  log(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  info(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
}

const devNull = (..._: any[]): void => undefined;

const getTimestamp = (): string => `[${dateToString(new Date())}]`;

export const createLogger = (
  env: LoggerEnvironment = { LOGGER_DEBUG: true, LOGGER_LOG: true }
): Logger => ({
  log: env.LOGGER_LOG
    ? (message: string, ...meta: any[]) => console.log(getTimestamp(), '[LOG]', message, ...meta)
    : devNull,
  debug: env.LOGGER_DEBUG
    ? (message: string, ...meta: any[]) => console.log(getTimestamp(), '[DEBUG]', message, ...meta)
    : devNull,
  info: env.LOGGER_DEBUG
    ? (message: string, ...meta: any[]) => console.log(getTimestamp(), '[INFO]', message, ...meta)
    : devNull,
  warn: env.LOGGER_LOG
    ? (message: string, ...meta: any[]) => console.warn(getTimestamp(), '[WARN]', message, ...meta)
    : devNull,
  error: env.LOGGER_LOG
    ? (message: string, ...meta: any[]) => console.error(getTimestamp(), '[ERROR]', message, ...meta)
    : devNull,
});

export const loggerGen = createLogger;

export const chattyLogger = createLogger({ LOGGER_DEBUG: true, LOGGER_LOG: true });
export const logger = createLogger({ LOGGER_DEBUG: false, LOGGER_LOG: true });
export const silentLogger = createLogger({ LOGGER_DEBUG: false, LOGGER_LOG: false });

export default chattyLogger;