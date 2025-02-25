import { createEventsEmitter as createStarEvents } from 'star-events';
import { arrayOf, arrayUnique, mapSeries, group, forEachSeries, unmerge, reduceWithBreakSync, reduceWithBreak, arraySum, splitBy, type Splition, getArrayFromZeroOfLengthN, getArrayRange } from './utils/array';
import { extractIPAddress } from './utils/extractIPAddress';
import getKeyOrThrow, { hasKey, hasKeyOrThrow, hasOwnProperty } from './utils/envHasKey';
import { hoursAgo, oneHourAgo, secondsToYMWDHMS, secondsToYMWDHMSSentence } from './utils/getStringDate';
import isError from './utils/isError';
import { pad, zeroPadded } from './utils/pad';
import plugIPAddressIntoContext from './utils/plugIPAddressIntoContext';
import sendSMS from './utils/sendSMS';
import { dateToString, excludeKeyWithValuesOfType, isMeantToBeFalse, isMeantToBeTrue, toString } from './utils/uncategorized';
import { DAY_IN_MILLISECONDS, getDateRangeFromTimeframe, getPastTimeRange, getThisDayTimeRange, getThisMonthTimeRange, getThisWeekTimeRange, getThisYearTimeRange, getTimeframeFromDateRange, getTimeRangeFromDateRange, getTimeRangeFromTimeframe, HOUR_IN_MILLISECONDS, isSameTimeRange, timeWindowToMilliseconds } from './utils/time';
import { deleteCookie, getCookie, setCookie } from './utils/cookie';
import { entriesMap } from './utils/entriesPromise';
import { Either, Left, Right, either } from './utils/functional';
import { envHasKeyGen, getTypedKey, DB_VAR_NAMES, envHasKeys, areKeysInEnv, areDBKeysInEnv } from './utils/env';
import { compose } from './utils/compose';
import { logger, createLogger } from 'saylo';

export type { UnknownEnv } from './utils/env';

export {
  arrayOf,
  arrayUnique,
  arraySum,
  compose,
  createStarEvents,
  dateToString,
  deleteCookie,
  either,
  Either,
  entriesMap,
  excludeKeyWithValuesOfType,
  extractIPAddress,
  forEachSeries,
  getCookie,
  getKeyOrThrow,
  getArrayFromZeroOfLengthN,
  getArrayRange,
  group,
  hasKey,
  hasKeyOrThrow,
  hasOwnProperty,
  hoursAgo,
  isError,
  isMeantToBeFalse,
  isMeantToBeTrue,
  Left,
  logger,
  createLogger as loggerGen,
  createLogger,
  mapSeries,
  oneHourAgo,
  pad,
  plugIPAddressIntoContext,
  reduceWithBreak,
  reduceWithBreakSync,
  Right,
  secondsToYMWDHMS,
  secondsToYMWDHMSSentence,
  setCookie,
  sendSMS,
  Splition,
  createStarEvents as starEvents,
  toString,
  unmerge,
  envHasKeyGen,
  getTypedKey,
  DB_VAR_NAMES,
  envHasKeys,
  areKeysInEnv,
  areDBKeysInEnv,
  zeroPadded,
  HOUR_IN_MILLISECONDS,
  DAY_IN_MILLISECONDS,
  getDateRangeFromTimeframe,
  getTimeframeFromDateRange,
  getThisDayTimeRange,
  getThisWeekTimeRange,
  getThisMonthTimeRange,
  getThisYearTimeRange,
  getPastTimeRange,
  getTimeRangeFromDateRange,
  getTimeRangeFromTimeframe,
  isSameTimeRange,
  timeWindowToMilliseconds,
  splitBy,
};
export default pad;
