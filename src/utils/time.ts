import { compose } from "./compose";

export type DateRangeIndex = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days';

export type SureStartSureEndDate<D = Date> = {
  startDate: D;
  endDate: D;
}

export interface TimeRange {
  startTime: number;
  endTime: number;
}

export type TimeWindow = "hour" | "day" | "week" | "month" | "year";

export type ChartTimeframe = "today" | "this week" | "this month" | "this year" | "past 24 hours" | "past 7 days" | "past 30 days" | "past 365 days" | "all time";

type TimeRangeGenerator = {
  timeframe: ChartTimeframe;
  method: (date: Date) => TimeRange;
}

export const HOUR_IN_MILLISECONDS = 60*60*1000;
export const DAY_IN_MILLISECONDS = 24*HOUR_IN_MILLISECONDS;

export function getThisDayTimeRange(date: Date): TimeRange {
  const copy = new Date(date);
  return {
    startTime: copy.setHours(0,0,0,0),
    endTime: copy.setHours(23,59,59,999),
  }
}

export function getThisWeekTimeRange(date: Date): TimeRange {
  const copy = new Date(date);
  const dayOfWeek = copy.getDay();
  const daysSinceWeekStart = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const thisMondayAsDayOfMonth = copy.getDate() - daysSinceWeekStart;

  const mondaySameTime = copy.setDate(thisMondayAsDayOfMonth);
  const sundaySameTime = mondaySameTime + 6*DAY_IN_MILLISECONDS;
  const mondayAt0000 = getThisDayTimeRange(new Date(mondaySameTime)).startTime;
  const sundayAt2359 = getThisDayTimeRange(new Date(sundaySameTime)).endTime;

  return {
    startTime: mondayAt0000,
    endTime: sundayAt2359,
  }
}

export function getThisMonthTimeRange(date: Date): TimeRange {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth());
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startTime: startOfMonth.getTime(),
    endTime: getThisDayTimeRange(endOfMonth).endTime,
  }
}

export function getThisYearTimeRange(date: Date): TimeRange {
  const startOfYear = new Date(date.getFullYear(), 0);
  const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59 , 59, 999);

  return {
    startTime: startOfYear.getTime(),
    endTime: endOfYear.getTime(),
  }
}


export const getPastTimeRange = (subtractMS: number) => (date: Date): TimeRange => {
  const endTime = date.getTime();
  const startTime = endTime - subtractMS;
  return {
    startTime,
    endTime,
  }
}

const timeRangeGenerators: TimeRangeGenerator[] = [
  { timeframe: "today", method: getThisDayTimeRange },
  { timeframe: "this week", method: getThisWeekTimeRange },
  { timeframe: "this month", method: getThisMonthTimeRange },
  { timeframe: "this year", method: getThisYearTimeRange },
  { timeframe: "past 24 hours", method: getPastTimeRange(DAY_IN_MILLISECONDS) },
  { timeframe: "past 7 days", method: getPastTimeRange(7 * DAY_IN_MILLISECONDS) },
  { timeframe: "past 30 days", method: getPastTimeRange(30 * DAY_IN_MILLISECONDS) },
  { timeframe: "past 365 days", method: getPastTimeRange(365 * DAY_IN_MILLISECONDS) },
];

export function getTimeRangeFromDateRange(range: SureStartSureEndDate): TimeRange {
  return {
    startTime: range.startDate.getTime(),
    endTime: range.endDate.getTime(),
  };
}

export const getDateRangeFromTimeRange = (timeRange: TimeRange): SureStartSureEndDate => {
  return {
    startDate: new Date(timeRange.startTime),
    endDate: new Date(timeRange.endTime),
  };
}


export function getTimeRangeFromTimeframe(timeframe: ChartTimeframe): TimeRange {
  const timeRangeGenerator = timeRangeGenerators.find(c => c.timeframe === timeframe);
  if (timeRangeGenerator === undefined) {
    throw new Error('Unexpected timeframe');
  }
  return timeRangeGenerator.method(new Date());
}

export function getTimeframeFromDateRange(dateRange: SureStartSureEndDate): ChartTimeframe | null {
  const timeRange = getTimeRangeFromDateRange(dateRange);
  const same = timeRangeGenerators.map(c => ({
    timeframe: c.timeframe,
    timeRange: c.method(new Date())
  })).filter(w => {
    return isSameTimeRange(w.timeRange, timeRange, DAY_IN_MILLISECONDS - 1000)
  });
  return same.length > 0 ? same[0].timeframe : null;
}

export const getDateRangeFromTimeframe = compose(getDateRangeFromTimeRange, getTimeRangeFromTimeframe);

export function isSameTimeRange(tra: TimeRange, trb: TimeRange, allowedMsDiff: number = 0): boolean {
  return tra.startTime === trb.startTime && (tra.endTime === trb.endTime || tra.endTime >= trb.endTime + allowedMsDiff);
}

export function timeWindowToMilliseconds(timeWindow: TimeWindow) {
  switch(timeWindow) {
    case "hour":
      return HOUR_IN_MILLISECONDS;
    case "day":
      return DAY_IN_MILLISECONDS;
    case "week":
      return 7 * DAY_IN_MILLISECONDS;
    case "month":
      return 30 * DAY_IN_MILLISECONDS;
    case "year":
      return 365 * DAY_IN_MILLISECONDS;
    default:
      throw new Error('Unexpected input');
  }
}