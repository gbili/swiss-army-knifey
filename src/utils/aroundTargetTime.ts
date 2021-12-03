import { NeedsLogger, CurryFuncWithDepsGen } from "../commonTypes";

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