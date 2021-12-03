import { expect } from 'chai';
import { correctDateToMatchTimeInTargetTimeZone, extractParamsFromString, getHostTimeZone, getHourDiff, hoursToAddToGoFromSourceToTargetTZ, timeIsMinutesAroundTargetGen } from '../../src/utils/aroundTargetTime';
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
    it('should return the same date when a date is converted to the same timezone and date is not ISO', async function() {
      const date = new Date("2021-12-02 16:15:08");
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
    it('should create a date with a difference in hours matching the timezone hour difference and date is not ISO', async function() {
      const date = new Date("2021-12-02 16:15:08");
      const hostTimeZone = getHostTimeZone();
      const targetTimeZone = 'Europe/Zurich';
      const expectedHourDiff = (hostTimeZone === 'Europe/Sofia') ? -1 : 0;
      const cannotTestHereSkip = (expectedHourDiff === 0 && hostTimeZone !== targetTimeZone);
      const correctedDate = correctDateToMatchTimeInTargetTimeZone(date, targetTimeZone);
      !cannotTestHereSkip && expect(getHourDiff(date, correctedDate)).to.equal(expectedHourDiff);
    });
  });


  describe(`givenDateInSourceTZHowManyHoursToAddToGetDateInTargetTZ(srcTZ, targetTZ)`, function() {
    describe(`zurich->sofia`, function() {
      const sourceTZ = 'Europe/Zurich';
      const targetTZ = 'Europe/Sofia';
      const expectedDiff = 1;
      it(`should return a difference of ${expectedDiff} hour for src:${sourceTZ} and target:${targetTZ}`, async function() {
        expect(hoursToAddToGoFromSourceToTargetTZ(sourceTZ, targetTZ)).to.equal(expectedDiff);
      });
    });
    describe(`sofia-zurich`, function() {
      const sourceTZ = 'Europe/Sofia' ;
      const targetTZ = 'Europe/Zurich';
      const expectedDiff = -1;
      it(`should return a difference of ${expectedDiff} hour for src:${sourceTZ} and target:${targetTZ}`, async function() {
        expect(hoursToAddToGoFromSourceToTargetTZ(sourceTZ, targetTZ)).to.equal(expectedDiff);
      });
    });
    describe(`zurich-cancun`, function() {
      const sourceTZ = 'America/Cancun' ;
      const targetTZ = 'Europe/Zurich';
      const expectedDiff = 6;
      it(`should return a difference of ${expectedDiff} hour for src:${sourceTZ} and target:${targetTZ}`, async function() {
        expect(hoursToAddToGoFromSourceToTargetTZ(sourceTZ, targetTZ)).to.equal(expectedDiff);
      });
    });
    describe(`cancun-madrid`, function() {
      const sourceTZ = 'America/Cancun' ;
      const targetTZ = 'Europe/Madrid';
      const expectedDiff = 6;
      it(`should return a difference of ${expectedDiff} hour for src:${sourceTZ} and target:${targetTZ}`, async function() {
        expect(hoursToAddToGoFromSourceToTargetTZ(sourceTZ, targetTZ)).to.equal(expectedDiff);
      });
    });
    describe(`madrid-cancun`, function() {
      const sourceTZ = 'Europe/Madrid';
      const targetTZ = 'America/Cancun';
      const expectedDiff = -6;
      it(`should return a difference of ${expectedDiff} hour for src:${sourceTZ} and target:${targetTZ}`, async function() {
        expect(hoursToAddToGoFromSourceToTargetTZ(sourceTZ, targetTZ)).to.equal(expectedDiff);
      });
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 4];
    const minutesMaxDistance = 10;
    const shouldSucceed = true; // yes delta of 4 min < 10
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 11];
    const minutesMaxDistance = 10;
    const shouldSucceed = false; // no delta of 11 min > 10
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 11];
    const minutesMaxDistance = 11;
    const shouldSucceed = true; // yes delta of 11 min <= 11
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 34];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 9];
    const minutesMaxDistance = 10;
    const shouldSucceed = true; // yes delta of 9 min < 10
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 4];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff - 1, target[1] + 49];
    const minutesMaxDistance = 10;
    const shouldSucceed = false; // no, delta of |-11| min > 10 (end of previous hour)
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [15, 4];
    const targetTZ = 'Europe/Zurich';
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff - 1, target[1] + 49];
    const minutesMaxDistance = 61;
    const shouldSucceed = true; // yes, delta of |-11| min < 61 (end of previous hour)
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      const dateInHostTZ = new Date(`2021-12-02 ${hHStr}:${hMStr}:00`);
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`timeIsMinutesAroundTarget`, function() {
    const target = [11, 6];
    const targetTZ = 'Europe/Zurich';
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 2];
    const minutesMaxDistance = 2;
    const shouldSucceed = true; // yes delta of 2 min <= 2
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const dateInHostTZ = new Date(`01/01/2021 ${hHStr}:${hMStr}`);

    it(`should be ${shouldSucceed} for ${minutesMaxDistance} minutes distance when target is ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const timeIsMinutesAroundTarget = timeIsMinutesAroundTargetGen({ logger });
      expect(timeIsMinutesAroundTarget({
        hostTZDate: dateInHostTZ,
        hostTimeZone: getHostTimeZone(),
        targetTimeZone: targetTZ,
        targetHourInTargetTZ: target[0],
        targetMinuteInTargetTZ: target[1],
        minutesDistance: minutesMaxDistance
      })).to.equal(shouldSucceed);
    });
  });

  describe(`correctDateToMatchTimeInTargetTimeZone`, function() {
    const target = [10, 48];
    const targetTZ = 'Europe/Zurich';
    const tHStr = zeroPadded(target[0], 2);
    const tMStr = zeroPadded(target[1], 2);
    const hostTZ = getHostTimeZone();
    const hDiff = hoursToAddToGoFromSourceToTargetTZ(targetTZ, hostTZ);
    const hostTZDate = [target[0] + hDiff, target[1] + 7];
    const hHStr = zeroPadded(hostTZDate[0], 2);
    const hMStr = zeroPadded(hostTZDate[1], 2);
    const dateInHostTZ = new Date(`01/01/2021 ${hHStr}:${hMStr}`);

    it(`should  ${tHStr}:${tMStr} - ${targetTZ}, and dateToCompareToTarget is ${hHStr}:${hMStr} - ${hostTZ} (are same)`, async function() {
      const correctedHM = correctDateToMatchTimeInTargetTimeZone(dateInHostTZ, targetTZ)
      expect(correctedHM.getHours()).to.equal(target[0]);
    });
  });
  describe(`givenDateInSourceHowManyHoursToAddToGetDateInTarget(srcTz, targetTz)`, function() {
    it('Given a date in Europe/Sofia, you must add -1 to get the date in target Europe/Zurich', async function() {
      expect(hoursToAddToGoFromSourceToTargetTZ('Europe/Sofia', 'Europe/Zurich')).to.equal(-1);
    });
    it('Given a date in Europe/Zurich, you must add 1 to get the date in target Europe/Sofia', async function() {
      expect(hoursToAddToGoFromSourceToTargetTZ('Europe/Zurich', 'Europe/Sofia')).to.equal(1);
    });
  });
  describe(`extractParamsFromString`, function() {
    it('should return two sets of params', async function() {
      const res = extractParamsFromString('2,47,10,Europe/Zurich;1,0,9,Europe/Sofia')
      expect(res.length).to.equal(2);
    });
    it('should return sets where the first has the H set properly', async function() {
      const res = extractParamsFromString('2,47,10,Europe/Zurich;1,0,9,Europe/Sofia')
      const [res1,] = res;
      expect(res1.targetHourInTargetTZ).to.equal(2);
    });
    it('should return sets where the first has the M set properly', async function() {
      const res = extractParamsFromString('2,47,10,Europe/Zurich;1,0,9,Europe/Sofia')
      const [res1,] = res;
      expect(res1.targetMinuteInTargetTZ).to.equal(47);
    });
    it('should return sets where the first has the minutesDistance set properly', async function() {
      const res = extractParamsFromString('2,47,10,Europe/Zurich;1,0,9,Europe/Sofia')
      const [res1,] = res;
      expect(res1.minutesDistance).to.equal(10);
    });
    it('should return sets where the first has the timezone set properly', async function() {
      const res = extractParamsFromString('2,47,10,Europe/Zurich;1,0,9,Europe/Sofia')
      const [res1,] = res;
      expect(res1.targetTimeZone).to.equal('Europe/Zurich');
    });
  });
});

