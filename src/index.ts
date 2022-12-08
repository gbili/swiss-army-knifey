import { correctDateToMatchTimeInTargetTimeZone, daysBefore, extractParamsFromString, getDateByYmd, getHostTimeZone, getHourDiff, hoursToAddToGoFromSourceToTargetTZ, loopUntilToday, oneDayBefore, toMilliseconds, timeIsMinutesAroundTargetGen, TimeUnit } from './utils/aroundTargetTime';
import createStarEvents from './utils/starEvents';
import { getArrayFromZeroOfLengthN, getArrayRange, arrayOf, arrayUnique, mapSeries, forEachSeries, unmerge } from './utils/array';
import { extractIPAddress } from './utils/extractIPAddress';
import getKeyOrThrow, { hasKey, hasKeyOrThrow, hasOwnProperty } from './utils/envHasKey';
import { hoursAgo, oneHourAgo, secondsToYMWDHMS, secondsToYMWDHMSSentence } from './utils/getStringDate';
import isError from './utils/isError';
import { pad, zeroPadded } from './utils/pad';
import plugIPAddressIntoContext from './utils/plugIPAddressIntoContext';
import sendSMS from './utils/sendSMS';
import starEvents from './utils/starEvents';
import sleep, { loggedSleep, logSleptForSeconds, sleepDaysCallback, sleepForCallback, sleepHoursCallback, sleepMillisecondsCallback, sleepMinutesCallback, sleepSecondsCallback, sleepyLoopUntilToday } from './utils/sleep';
import { excludeKeyWithValuesOfType, toString } from './utils/uncategorized';
import { DAY_IN_MILLISECONDS, getDateRangeFromTimeframe, getPastTimeRange, getThisDayTimeRange, getThisMonthTimeRange, getThisWeekTimeRange, getThisYearTimeRange, getTimeframeFromDateRange, getTimeRangeFromDateRange, getTimeRangeFromTimeframe, HOUR_IN_MILLISECONDS, isSameTimeRange, timeWindowToMilliseconds } from './utils/time';

if (typeof window === 'undefined') {

  // {
  // createDir,
  // createDirIfNotExists,
  // createHeadersOptionWithCookie,
  // createHeadersWithPHPSESSID,
  // download,
  // existsDir,
  // get,
  // getCouldBeNodeModuleRootDir,
  // getFileContents,
  // getFileContentsSync,
  // getNodeModuleRootDir,
  // getPHPSESSIDWithoutPathOrEmpty,
  // getUserRootDirOrThrow,
  // getRootDir,
  // isWithinNodeModuleOrClonedRepo,
  // isWithinNodeModule,
  // pathCouldBeNodeModuleRootDir,
  // pathWithinCouldBeNodeModule,
  // putFileContents,
  // putFileContentsSync,
  // request,
  // }

}

export {
  arrayOf,
  arrayUnique,
  correctDateToMatchTimeInTargetTimeZone,
  createStarEvents,
  daysBefore,
  excludeKeyWithValuesOfType,
  extractIPAddress,
  extractParamsFromString,
  forEachSeries,
  getArrayFromZeroOfLengthN,
  getArrayRange,
  getDateByYmd,
  getHostTimeZone,
  getHourDiff,
  getKeyOrThrow,
  hasKey,
  hasKeyOrThrow,
  hasOwnProperty,
  hoursAgo,
  hoursToAddToGoFromSourceToTargetTZ,
  isError,
  loggedSleep,
  logSleptForSeconds,
  loopUntilToday,
  mapSeries,
  oneHourAgo,
  oneDayBefore,
  pad,
  plugIPAddressIntoContext,
  secondsToYMWDHMS,
  secondsToYMWDHMSSentence,
  sleep,
  sleepForCallback,
  sleepMillisecondsCallback,
  sleepSecondsCallback,
  sleepMinutesCallback,
  sleepHoursCallback,
  sleepDaysCallback,
  sleepyLoopUntilToday,
  sendSMS,
  starEvents,
  timeIsMinutesAroundTargetGen,
  TimeUnit,
  toMilliseconds,
  toString,
  unmerge,
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
};
export default pad;
