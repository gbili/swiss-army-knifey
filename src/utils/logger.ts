import { dateToString } from "./uncategorized";

export const loggerGen = function (env: { LOGGER_LOG: boolean; LOGGER_DEBUG: boolean; }, canLog: { log: (...args: any[]) => any; } = console) {
  const devNull = (..._: any[]) => undefined;
  return {
    log: env.LOGGER_LOG
        ? canLog.log
        : devNull,
    debug: env.LOGGER_DEBUG
      ? canLog.log
      : devNull,
    prod: (...args: any[]) => canLog.log(dateToString(new Date()), ' --- ', ...args),
  };
}

export default loggerGen({ LOGGER_DEBUG: false, LOGGER_LOG: true });