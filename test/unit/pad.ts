import { expect } from 'chai';
import { pad, zeroPadded } from '../../src/utils/pad';

describe('pad', function () {
  describe(`pad("hel", "abc", n, "start")`, function() {
    it('should hel, abc, 10, "start" -> abcabcahel', async function() {
      expect(pad("hel", "abc", 10, "start")).to.equal("abcabcahel");
    });
    it('should hel, abc, 5, "start" -> abhel', async function() {
      expect(pad("hel", "abc", 5, "start")).to.equal("abhel");
    });
    it('should hel, abc, 2, "start" -> hel', async function() {
      expect(pad("hel", "abc", 2, "start")).to.equal("hel");
    });
  });
  describe(`zeroPadded(num, len)`, function() {
    it('should 23, 2 -> "23"', async function () {
      expect(zeroPadded(23, 2)).to.equal("23");
    });
    it('should 3, 2 -> "03"', async function () {
      expect(zeroPadded(3, 2)).to.equal("03");
    });
    it('should 3, 5 -> "00003"', async function () {
      expect(zeroPadded(3, 5)).to.equal("00003");
    });
    it('should 0, 2 -> "00"', async function () {
      expect(zeroPadded(0, 2)).to.equal("00");
    });
    it('should have a default lenght of 2: 1 -> "01"', async function () {
      expect(zeroPadded(0)).to.equal("00");
    });
  });
});

