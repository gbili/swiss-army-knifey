import { loopBetweenDayStarts, TimeUnit, toMilliseconds } from "./aroundTargetTime";
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

export const sleepMillisecondsCallback = sleepForCallback(TimeUnit.hour);
export const sleepSecondsCallback = sleepForCallback(TimeUnit.second);
export const sleepMinutesCallback = sleepForCallback(TimeUnit.minute);
export const sleepHoursCallback = sleepForCallback(TimeUnit.hour);
export const sleepDaysCallback = sleepForCallback(TimeUnit.day);

export async function loggedSleep(seconds: number) {
  return await sleepSecondsCallback(seconds, logSleptForSeconds);
}

export async function sleepyLoopUntilToday(props: {
  from: Date,
  doBeforeEachSleepCallback: (date: Date) => any,
  sleepForSeconds?: number,
  shouldAwaitCallback?: boolean,
  doEachSecond?: (second: number) => any,
}) {
  return await sleepyLoopBetween({...props, to: new Date()})
}

export async function sleepyLoopBetween({ from, to, doBeforeEachSleepCallback, sleepForSeconds, shouldAwaitCallback, doEachSecond }: {
  from: Date,
  to: Date,
  doBeforeEachSleepCallback: (date: Date) => any,
  sleepForSeconds?: number,
  shouldAwaitCallback?: boolean,
  doEachSecond?: (second: number) => any,
}) {
  return await loopBetweenDayStarts(from, to, async date => {
    shouldAwaitCallback ? await doBeforeEachSleepCallback(date) : doBeforeEachSleepCallback(date);
    await sleepSecondsCallback(sleepForSeconds || 5, doEachSecond);
  });
}