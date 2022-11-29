import { expect } from 'chai';
import { serializeAsURIComponents } from '../../src/utils/uncategorized';

describe('serializeAsURIComponents', function () {
  describe(`serializeAsURIComponents({ hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' })`, function() {
    it('should hel, abc, 10, "start" -> abcabcahel', async function() {
      const o = { hey: 1, 1: 'one', 2: undefined, two: undefined, three: null, four: 'four' };
      expect(serializeAsURIComponents(o)).to.equal("1=one&hey=1&three=null&four=four");
    });
  });
});

