import { loopUntilToday } from "./aroundTargetTime";
import { getArrayFromZeroTo } from "./array";

export default async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function logSleptForSeconds(s: number) {
  console.log(`Slept for ${s} seconds`);
}

export async function sleepSecondsCallback(seconds: number, betweenSecondsCallback: (s: number) => void = () => {}) {
  for (const i of getArrayFromZeroTo(seconds)) {
    betweenSecondsCallback(i);
    await sleep(1000);
  }
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
