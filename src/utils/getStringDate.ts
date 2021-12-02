import { zeroPadded } from "./pad";

type TimeUnitElement = { count: number; name: string; toUpperFactor: number; };

export default function (timestamp: number) {
  const today = new Date(timestamp);
  const dd = zeroPadded(today.getDate());
  const mm = zeroPadded(today.getMonth() + 1); //January is 0!
  const time = `${zeroPadded(today.getHours())}:${zeroPadded(today.getMinutes())}:${zeroPadded(today.getSeconds())}`;

  return `${dd}/${mm}/${today.getFullYear()}, ${time}`;
}

export const oneHourAgo = () => hoursAgo(1);

export function hoursAgo(n: number) {
  return Date.now() - n * 60 * 60 * 1000;
}

export function secondsToYMWDHMS(totalSeconds: number): TimeUnitElement[] {
  const conversionFactors = [
    {
      name: 'seconds',
      toUpperFactor: 60,
    },
    {
      name: 'minutes',
      toUpperFactor: 60,
    },
    {
      name: 'hours',
      toUpperFactor: 24,
    },
    {
      name: 'days',
      toUpperFactor: 7,
    },
    {
      name: 'weeks',
      toUpperFactor: 4,
    },
    {
      name: 'months',
      toUpperFactor: 12,
    },
    {
      name: 'years',
      toUpperFactor: Infinity,
    }
  ];
  const curriedMUTABLEMapReducer = MUTABLEMapReducer(totalSeconds);
  return conversionFactors
    .map(el => ({
      ...el,
      count: curriedMUTABLEMapReducer(el.toUpperFactor),
    }))
    .reverse();

}

export function secondsToYMWDHMSSentence(totalSeconds: number): string {
    return secondsToYMWDHMS(totalSeconds)
      .filter(el => el.count > 0)
      .map(el => `${el.count} ${el.name}`)
      .join(', ');
}

const MUTABLEMapReducer = (MUTABLETotalLowerUnits: number) => {
  return function MUTABLEComputeLowerAndTotalUpper(lowerPerUpper: number) {
    const lower = MUTABLETotalLowerUnits % lowerPerUpper;
    const totalUpper = Math.floor(MUTABLETotalLowerUnits / lowerPerUpper);
    MUTABLETotalLowerUnits = totalUpper;
    return lower;
  }
}