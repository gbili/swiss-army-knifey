import { loopUntilToday, TimeUnit, toMilliseconds } from "./aroundTargetTime";
import { getArrayFromZeroOfLengthN } from "./array";

/**
 * Sleep for x units (units is milliseconds by default)
 * @param n number of units to sleep for
 * @param unit TimeUnit? or milliseconds by default
 * @returns void
 */
export default async function sleep(n: number, unit?: TimeUnit): Promise<void> {
  const ms = unit === undefined ? n : Math.round(n*toMilliseconds(unit));
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const sleepForCallback = (unit: TimeUnit) => {
  const msConverter = toMilliseconds(unit);
  return async (n: number, betweenSleepsCallback: (current: number, total: number, unit: TimeUnit) => void = () => {}) => {
    for (const i of getArrayFromZeroOfLengthN(n)) {
      betweenSleepsCallback(i, n, unit);
      await sleep(msConverter);
    }
  }
}

export function logSleptForSeconds(s: number) {
  console.log(`Slept for ${s} seconds`);
}

export const sleepMillisecondsCallback = sleepForCallback(TimeUnit.hours);
export const sleepSecondsCallback = sleepForCallback(TimeUnit.seconds);
export const sleepMinutesCallback = sleepForCallback(TimeUnit.minutes);
export const sleepHoursCallback = sleepForCallback(TimeUnit.hours);
export const sleepDaysCallback = sleepForCallback(TimeUnit.days);

export async function loggedSleep(seconds: number) {
  return await sleepSecondsCallback(seconds, logSleptForSeconds);
}

export async function sleepyLoopUntilToday({ startAt, doBeforeEachSleepCallback, sleepForSeconds, shouldAwaitCallback, doEachSecond }: {
  startAt: Date,
  doBeforeEachSleepCallback: (date: Date) => any,
  sleepForSeconds?: number,
  shouldAwaitCallback?: boolean,
  doEachSecond?: (second: number) => any,
}) {
  return await loopUntilToday(startAt, async date => {
    shouldAwaitCallback ? await doBeforeEachSleepCallback(date) : doBeforeEachSleepCallback(date);
    await sleepSecondsCallback(sleepForSeconds || 5, doEachSecond);
  });
}
