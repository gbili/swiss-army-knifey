import { expect } from 'chai';
import { dateToString, toString } from '../../src/utils/uncategorized';

describe('toString', function () {
  describe(`toString({ hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' })`, function() {
    it('should hel, abc, 10, "start" -> abcabcahel', async function() {
      const o = { hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' };
      expect(toString(o)).to.equal("[object Object]");
    });
  });

  describe(`dateToString(new Date('08-10-1987 20:12:00')`, function() {
    it('should hel, abc, 10, "start" -> abcabcahel', async function() {
      expect(dateToString(new Date('08-10-1983 20:12:00'))).to.equal("1983-08-10 20:12:00");
    });
  });
});

