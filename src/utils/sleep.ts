import { loopUntilToday, TimeUnit, toMilliseconds } from "./aroundTargetTime";
import { getArrayFromZeroTo } from "./array";

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
  return async (n: number, betweenSleepsCallback: (s: number) => void = () => {}) => {
    for (const i of getArrayFromZeroTo(n)) {
      betweenSleepsCallback(i);
      await sleep(msConverter);
    }
  }
}

export function logSleptForSeconds(s: number) {
  console.log(`Slept for ${s} seconds`);
}

export async function sleepSecondsCallback(seconds: number, betweenSleepsCallback: (s: number) => void = () => {}) {
  await (sleepForCallback(TimeUnit.seconds)(seconds, betweenSleepsCallback));
}

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
