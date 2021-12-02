import { expect } from 'chai';
import { correctDateToMatchTimeInTargetTimeZone, getHostTimeZone, getHourDiff, givenDateInSourceTZHowManyHoursToAddToGetDateInTargetTZ, timeIsMinutesAroundTargetGen } from '../../src/utils/aroundTargetTime';
import { zeroPadded } from '../../src/utils/pad';

const logger = {
  log: console.log,
  debug: console.log,
};

describe('time', function () {
  describe(`getHostTimeZone`, function() {
    it('should return a string with a slash', async function() {
      expect(getHostTimeZone().split('/').length).to.equal(2);
    });
  });
  describe(`correctDateToMatchTimeInTargetTimeZone`, function() {
    it('should return the same date when a date is converted to the same timezone', async function() {
      const date = new Date("2021-12-02T16:15:08.000Z");
      const hostTimeZone = getHostTimeZone();
      expect(correctDateToMatchTimeInTargetTimeZone(date, hostTimeZone).toString()).to.equal(date.toString());
    });
    it('should create a date with a difference in hours matching the timezone hour difference', async function() {
      const date = new Date("2021-12-02T16:15:08.000Z");
      const hostTimeZone = getHostTimeZone();
      const targetTimeZone = 'Europe/Zurich';
      const expectedHourDiff = (hostTimeZone === 'Europe/Sofia') ? -1 : 0;
      const cannotTestHereSkip = (expectedHourDiff === 0 && hostTimeZone !== targetTimeZone);
      const correctedDate = correctDateToMatchTimeInTargetTimeZone(date, targetTimeZone);
      !cannotTestHereSkip && expect(getHourDiff(date, correctedDate)).to.equal(expectedHourDiff);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const dateToCompareToInHosTZ = [16, 30];
    const minutesMaxDistance = 10;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = true; // yes delta of 4 min < 10

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const dateToCompareToInHosTZ = [16, 45];
    const minutesMaxDistance = 10;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = false; // no delta of 11 min > 10

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const dateToCompareToInHosTZ = [16, 45];
    const minutesMaxDistance = 11;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = true; // yes delta of 11 min <= 11

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 4];
    const dateToCompareToInHosTZ = [15, 55];
    const minutesMaxDistance = 10;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = true; // yes delta of 9 min < 10

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 4];
    const dateToCompareToInHosTZ = [15, 53];
    const minutesMaxDistance = 10;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = false; // no delta of 11 min > 10

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 4];
    const dateToCompareToInHosTZ = [15, 53];
    const minutesMaxDistance = 61;
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const shouldSucceed = true; // yes delta of 11 min < 61

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${target[0]}:${target[1]} - ${targetTZ}, and dateToCompareToTarget is ${dateToCompareToInHosTZ[0]}:${dateToCompareToInHosTZ[1]} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger, hostTimeZone: getHostTimeZone(), targetTimeZone: targetTZ });
      const dateInHostTZ = new Date(`2021-12-02T${zeroPadded(dateToCompareToInHosTZ[0], 2)}:${zeroPadded(dateToCompareToInHosTZ[1], 2)}:00.000Z`);
      expect(timeIsMinutesAroundTarget({ hostTZDate: dateInHostTZ, targetHourInTargetTZ: target[0], targetMinuteInTargetTZ: target[1], minutesDistance: minutesMaxDistance })).to.equal(shouldSucceed);
    });
  });

  describe(`givenDateInSourceHowManyHoursToAddToGetDateInTarget(srcTz, targetTz)`, function() {
    it('Given a date in Europe/Sofia, you must add -1 to get the date in target Europe/Zurich', async function() {
      expect(givenDateInSourceTZHowManyHoursToAddToGetDateInTargetTZ('Europe/Sofia', 'Europe/Zurich')).to.equal(-1);
    });
    it('Given a date in Europe/Zurich, you must add 1 to get the date in target Europe/Sofia', async function() {
      expect(givenDateInSourceTZHowManyHoursToAddToGetDateInTargetTZ('Europe/Zurich', 'Europe/Sofia')).to.equal(1);
    });
  });
});

