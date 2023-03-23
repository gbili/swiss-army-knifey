import { expect } from 'chai';
import { sleepyLoopBetween, startOfDay } from '../../src';

describe('sleepyLoopBetween', () => {

  it('should call doBeforeEachSleepCallback with the given date', async () => {
    const from = new Date("2023-03-17 12:46:23");
    const to = new Date("2023-03-17 12:46:23");
    const doBeforeEachSleepCallback = (date: Date) => {
      expect(date).to.deep.equal(startOfDay(from));
    };
    await sleepyLoopBetween({ from, to, doBeforeEachSleepCallback });
  });

  it('should call doBeforeEachSleepCallback with shouldAwaitCallback set to true', async () => {
    const from = new Date("2023-03-17 12:46:23");
    const to = new Date("2023-03-17 12:46:23");
    const shouldAwaitCallback = true;
    const doBeforeEachSleepCallback = (date: Date) => {
      expect(shouldAwaitCallback).to.be.true;
    };
    await sleepyLoopBetween({ from, to, shouldAwaitCallback, doBeforeEachSleepCallback });
  });

  const from = new Date('2020-01-01');
  const to = new Date('2020-01-04');
  const sleepForSeconds = 2;
  const shouldAwaitCallback = true;
  const daysInPeriod = (to.getDay() - from.getDay() + 1)

  it('calls doBeforeEachCallback (end-start)+1 times', async () => {
    let callCount = 0;
    await sleepyLoopBetween({
      from,
      to,
      doBeforeEachSleepCallback: (date: Date) => callCount++,
      sleepForSeconds,
      shouldAwaitCallback,
      doEachSecond: (_: number) => {},
    });
    expect(callCount).to.equal(daysInPeriod);
  });

  it('awaits 5 seconds when sleepForSeconds: 5', async () => {
    let startTime = Date.now();
    await sleepyLoopBetween({
      from,
      to,
      doBeforeEachSleepCallback: (_: Date) => {},
      sleepForSeconds,
      shouldAwaitCallback,
      doEachSecond: (_: number) => {},
    });
    let endTime = Date.now();
    expect(endTime - startTime).to.be.greaterThan(sleepForSeconds * 1000);
  });

  it(`calls doEachSecond each day including bounds: 1, 2, 3, 4 = ${daysInPeriod} times: (end-start)+1`, async () => {
    let callCount = 0;
    await sleepyLoopBetween({
      from,
      to,
      doBeforeEachSleepCallback: (_: Date) => undefined,
      sleepForSeconds,
      shouldAwaitCallback,
      doEachSecond: (_: number) => callCount++,
    });
    expect(callCount).to.equal(sleepForSeconds * daysInPeriod);
  });

  it('awaits the amount of seconds specified in sleepForSeconds', async () => {
    const startTime = Date.now();
    const sleepForSeconds = 2;
    await sleepyLoopBetween({
      from,
      to,
      doBeforeEachSleepCallback: (_: Date) => undefined,
      sleepForSeconds,
      shouldAwaitCallback,
      doEachSecond: (_: number) => {},
    });
    expect(Date.now() - startTime).to.be.greaterThan((daysInPeriod-1) * sleepForSeconds * 1000);
  });

});