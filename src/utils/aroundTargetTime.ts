import { NeedsLogger, CurryFuncWithDepsGen } from "../commonTypes";
import { getArrayFromZeroOfLengthN } from "./array";

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
  millisecond='millisecond',
  second='second',
  minute='minute',
  hour='hour',
  day='day',
  week='week',
}

export const unitToLowerFactor: { [k in TimeUnit]: number; } = {
  millisecond: 1,
  second: 1000,
  minute: 60,
  hour: 60,
  day: 24,
  week: 7,
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

export function startOfDay(date: Date) {
  return startOfTimeUnit(date, TimeUnit.day);
}

export function endOfDay(date: Date) {
  return endOfTimeUnit(date, TimeUnit.day);
}

export function startOfTimeUnit(date: Date, unit: TimeUnit): Date {
  switch (unit) {
    case TimeUnit.millisecond:
      return new Date(date.getTime());
    case TimeUnit.second:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    case TimeUnit.minute:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
    case TimeUnit.hour:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
    case TimeUnit.day:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case TimeUnit.week:
      let startOfWeek = new Date(date.getTime());
      startOfWeek.setDate(date.getDate() - date.getDay());
      return startOfWeek;
    default:
      return date;
  }
}

export function endOfTimeUnit(date: Date, unit: TimeUnit): Date {
  switch (unit) {
    case TimeUnit.millisecond:
      return new Date(date.getTime());
    case TimeUnit.second:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 999);
    case TimeUnit.minute:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 59, 999);
    case TimeUnit.hour:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 59, 59, 999);
    case TimeUnit.day:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    case TimeUnit.week:
      let endOfWeek = new Date(date.getTime());
      endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
      return endOfWeek;
    default:
      return date;
  }
}

export function daysBefore(n: number, date: Date) {
  return getArrayFromZeroOfLengthN(n).reduce(oneDayBefore, date);
}

export type ZeroMonth = 0|1|2|3|4|5|6|7|8|9|10|11
export type DayOfMonth = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;

export function getDateByYmd(y: number, m: ZeroMonth, d: DayOfMonth) {
  return new Date(Date.UTC(y, m, d));
}

export async function loopUntilToday(from: Date, callback: (d: Date) => Promise<void>) {
  const today = new Date();
  await loopBetweenDayStarts(from, today, callback);
}

export function incrementDateBy(date: Date, amount: number, unit: TimeUnit) {
  let mutating = new Date(date);
  switch (unit) {
    case TimeUnit.millisecond:
      mutating.setMilliseconds(date.getMilliseconds() + amount);
      break;
    case TimeUnit.second:
      mutating.setSeconds(date.getSeconds() + amount);
      break;
    case TimeUnit.minute:
      mutating.setMinutes(date.getMinutes() + amount);
      break;
    case TimeUnit.hour:
      mutating.setHours(date.getHours() + amount);
      break;
    case TimeUnit.day:
      mutating.setDate(date.getDate() + amount);
      break;
    case TimeUnit.week:
      mutating.setDate(date.getDate() + 7 * amount);
      break;
    default:
      throw new Error(`Unhandled case, time unit was: ${unit}` );
  }
  return mutating;
}


/**
 * Given two dates, it will loop through day incremented dates. Discards the time part.
 * And pass those dates as parameters to callback.
 * Discards the time part, and only considers the date. Passes start of day between from and to to callback
 * E.g. If from is 2023-03-18 10:15:00, callback will receive 2023-03-18 00:00:00 (even if it's outbounds)
 *      If to is 2023-03-18 01:15:00, callback will still receive 2023-03-18 00:00:00 once (even if it's from > to)
 * @see loopBetweenTimes for a function that strictly respects bounds
 * @param from Date start date
 * @param to Date max date
 * @param callback ()
 */
export async function loopBetweenDayStarts(from: Date, to: Date, callback: (d: Date) => Promise<void>) {
  let parameterDate = startOfDay(from);
  while (parameterDate <= to) {
    await callback(new Date(parameterDate))
    parameterDate = incrementDateBy(new Date(parameterDate), 1, TimeUnit.day);
  }
}

/**
 * Given two dates, it will loop through unit incremented dates.
 * And pass those dates as parameters to <callback>.
 * It will consider the time part of the date. <callback> will always receive <from> date, and
 * then all the increments. Below <to> date (except when includeToWhenLowerIncrementThanUnit: true,
 * in which case <to> is passed as well).
 *
 * E.g. If <from> is 2023-03-18 10:15:00 and <to> is 2023-03-18 01:15:00 <incrementUnit> TimeUnit.day
 *   callback will receive:
 *     - <to> (once, and nothing else)
 *
 * E.g. If <from> is 2023-03-18 10:15:00 and <to> is 2023-03-19 01:15:00 <incrementUnit> TimeUnit.day
 *   callback will receive:
 *     - <from>, then
 *     - 2023-03-19 00:00:00, and finally
 *     - <to> (only when includeToWhenLowerIncrementThanUnit: true)
 *
 * @param from Date start date
 * @param to Date max date (only passed to callback when it corresponds to a start of day date)
 * @param callback ()
 */
export async function loopBetweenTimes({
  from,
  to, callback,
  incrementUnit,
  includeToWhenLowerIncrementThanUnit
}: {
  from: Date;
  to: Date;
  callback: (d: Date) => Promise<void>;
  incrementUnit: TimeUnit;
  includeToWhenLowerIncrementThanUnit?: boolean;
}) {
  let parameterDate = from;
  while (parameterDate <= to) {
    await callback(new Date(parameterDate))
    parameterDate = incrementDateBy(new Date(parameterDate), 1, incrementUnit);
    parameterDate = startOfTimeUnit(parameterDate, incrementUnit);
  }
  if (to.getTime() !== from.getTime() && includeToWhenLowerIncrementThanUnit && parameterDate > to) {
    await callback(new Date(to))
  }
}