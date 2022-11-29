import { expect } from 'chai';
import { toString } from '../../src/utils/uncategorized';

describe('toString', function () {
  describe(`toString({ hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' })`, function() {
    it('should hel, abc, 10, "start" -> abcabcahel', async function() {
      const o = { hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' };
      expect(toString(o)).to.equal("[object Object]");
    });
  });
});

