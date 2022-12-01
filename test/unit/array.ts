import { expect } from 'chai';
import { getArrayRange } from '../../src/utils/array';

describe('pad', function () {
  describe(`getArrayRange(start, end)`, function() {
    it('should getArrayRange(-4, 5) return [-4..-1]', async function() {
      expect(getArrayRange(-4, -1)).to.deep.equal([-4, -3, -2, -1]);
    });
    it('should getArrayRange(-4, 5) return [-4..5]', async function() {
      expect(getArrayRange(-4, 5)).to.deep.equal([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
    });
    it('should getArrayRange(1, 10) return [1..10]', async function() {
      expect(getArrayRange(1, 10)).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
    it('should getArrayRange(0, 9) return []', async function() {
      expect(getArrayRange(0, 9).length).to.equal(10);
    });
  });
  describe(`zeroPadded(num, len)`, function() {
    it('should 23, 2 -> "23"', async function () {
      // expect(zeroPadded(23, 2)).to.equal("23");
    });
  });
});

