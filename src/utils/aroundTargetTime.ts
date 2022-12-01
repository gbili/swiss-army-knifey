import { NeedsLogger, CurryFuncWithDepsGen } from "../commonTypes";
import { getArrayFromZeroTo } from "./array";

type TimeIsMinutesAroundTargetProps = {}
  & { hostTZDate: Date; }
  & { targetHourInTargetTZ: number; }
  & { targetMinuteInTargetTZ: number; }
  & { minutesDistance: number; }
  & { hostTimeZone?: string }
  & { targetTimeZone?: string }
export type TimeIsMinutesAroundTargetDeps = {}
  & NeedsLogger
export type TimeIsMinutesAroundTarget = (props: TimeIsMinutesAroundTargetProps) => boolean
export type TimeIsMinutesAroundTargetGen = CurryFuncWithDepsGen<TimeIsMinutesAroundTargetDeps, TimeIsMinutesAroundTarget>

export const correctDateToMatchTimeInTargetTimeZone = (dateInBrowser: Date | string, targetTimeZone?: string) => new Date((typeof dateInBrowser === 'string' ? dateInBrowser : dateInBrowser).toLocaleString('en-US', targetTimeZone ? { timeZone: targetTimeZone } : undefined));

/**
 * Returns the js host timeZone ex: 'Europe/Zurich'
 * @returns string
 */
export const getHostTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * The number of hours to add to a date in tz2 to get that date in tz1
 * @param tz1 source
 * @param tz2 target
 * @returns number
 */
export const hoursToAddToGoFromSourceToTargetTZ = (sourceTimeZone: string, targetTimeZone: string) => {
  const now = new Date();
  const dateInSourceTimeZone = correctDateToMatchTimeInTargetTimeZone(now, sourceTimeZone);
  const dateInTargetTimeZone = correctDateToMatchTimeInTargetTimeZone(now, targetTimeZone);
  return getHourDiff(dateInSourceTimeZone, dateInTargetTimeZone);
}

/**
 * S
 * @param str string Ex: '2,47,10,Europe/Zurich;1,0,9,Europe/Sofia'
 * @returns { targetTimeZone: string, targetHourInTargetTZ: number, targetMinuteInTargetTZ: number, minutesDistance: number }[]
 */
export const extractParamsFromString = (str: string) => {
  return str.split(';').map(part => {
    const [h, m, d, targetTimeZone] = part.split(',');
    return { targetHourInTargetTZ: parseInt(h), targetMinuteInTargetTZ: parseInt(m), minutesDistance: parseInt(d), targetTimeZone };
  });
}

/**
 * Get the hour difference between a and b
 * @param b Date
 * @param a Date
 * @returns a - b in hours
 */
export const getHourDiff = (b: Date, a: Date) => {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60));
}

export const timeIsMinutesAroundTargetGen: TimeIsMinutesAroundTargetGen = ({ logger }) => ({ hostTimeZone, hostTZDate, targetTimeZone, targetHourInTargetTZ, targetMinuteInTargetTZ, minutesDistance }: TimeIsMinutesAroundTargetProps) => {
  const dateInTargetTZ = correctDateToMatchTimeInTargetTimeZone(hostTZDate, targetTimeZone);
  const hoursDistance = Math.floor(minutesDistance / 60);
  const minutesRestDistance = minutesDistance % 60;
  const diff = targetMinuteInTargetTZ - minutesRestDistance;
  const sum = targetMinuteInTargetTZ + minutesRestDistance;
  const spillDown = diff < 0;
  const spillUp = sum >= 60;
  const rawHoursLB = targetHourInTargetTZ - (hoursDistance + (spillDown ? 1 : 0));
  const hoursLB = rawHoursLB + (rawHoursLB < 0 ? 24 : 0);
  const minutesLB = (spillDown ? 60 : 0) + diff
  const rawHoursUB = targetHourInTargetTZ + (hoursDistance + (spillUp ? 1 : 0));
  const hoursUB = rawHoursUB % 24;
  const minutesUB = sum + (spillUp ? -60 : 0);
  const timeIsHigherThanTargetLB = (dateInTargetTZ.getHours() > hoursLB || (dateInTargetTZ.getHours() === hoursLB && dateInTargetTZ.getMinutes() >= minutesLB));
  const timeIsLowerThanTargetUB = (dateInTargetTZ.getHours() < hoursUB || (dateInTargetTZ.getHours() === hoursUB && dateInTargetTZ.getMinutes() <= minutesUB));
  logger.debug(`------------------${dateInTargetTZ.getHours()}:${dateInTargetTZ.getMinutes()} || ----------------UB-${dateInTargetTZ.getHours()}:${dateInTargetTZ.getMinutes()}`, timeIsHigherThanTargetLB, timeIsLowerThanTargetUB);
  logger.debug(`rawHoursLB-${rawHoursLB}, LB-${hoursLB}:${minutesLB} || rawHoursUB-${rawHoursUB},  UB-${hoursUB}:${minutesUB}`, timeIsHigherThanTargetLB, timeIsLowerThanTargetUB);
  return timeIsHigherThanTargetLB && timeIsLowerThanTargetUB;
}

export enum TimeUnit {
  seconds='seconds',
  minutes='minutes',
  hours='hours',
  days='days',
}

export const unitToLowerFactor: { [k in TimeUnit]: number; } = {
  seconds: 1000,
  minutes: 60,
  hours: 60,
  days: 24,
}

export function toMilliseconds(unit: TimeUnit) {
  type Reduction = { units: TimeUnit[]; finished: boolean; };
  const keys = Object.keys(unitToLowerFactor) as TimeUnit[];
  const { units } = keys.reduce((p: Reduction, k): Reduction => {
    if (p.finished) return p;
    return {
      units: [...p.units, k],
      finished: k === unit,
    };
  }, { units: [], finished: false });

  return units.reduce((p, k) => {
    return p * unitToLowerFactor[k];
  }, 1);
}

export function oneDayBefore(date: Date) {
  return new Date((new Date(date.getTime())).setDate(date.getDate() - 1))
}
export function daysBefore(n: number, date: Date) {
  return getArrayFromZeroTo(n).reduce(oneDayBefore, date);
}

export type ZeroMonth = 0|1|2|3|4|5|6|7|8|9|10|11
export type DayOfMonth = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;

export function getDateByYmd(y: number, m: ZeroMonth, d: DayOfMonth) {
  return new Date(Date.UTC(y, m, d));
}

export async function loopUntilToday(since: Date, callback: (d: Date) => Promise<void>) {
  const today = new Date();
  for (const d = since; d <= today; d.setDate(d.getDate() + 1)) {
    await callback(new Date(d));
  }
}