import { expect } from 'chai';
import { getArrayRange, ReducerWithBrakeCallback, reduceWithBreakSync, ShouldBreakCallback } from '../../src/utils/array';

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

  describe('reduceWithBreak', () => {

    it('should return the correct result when the loop is not interrupted', () => {
        const arr = [1, 2, 3, 4, 5];
        const reducer: ReducerWithBrakeCallback<number, number> = (acc, curr) => acc + curr;
        const shouldBreak: ShouldBreakCallback<number, number> = (acc, curr) => acc > 10;
        const initialValue = 0;

        const result = reduceWithBreakSync(arr, reducer, shouldBreak, initialValue);
        expect(result).to.equal(1+2+3+4+5);
    });

    it('should return the correct result when the loop is interrupted', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const reducer: ReducerWithBrakeCallback<number, number> = (acc, curr) => acc * curr;
        const shouldBreak: ShouldBreakCallback<number, number>  = (acc, curr) => curr > 5;
        const initialValue = 1;

        const result = reduceWithBreakSync(arr, reducer, shouldBreak, initialValue);
        expect(result).to.equal(5*4*3*2*1);
    });

    it('should return the correct result when the loop is interrupted because of the accumulator', () => {
        const arr = ['a', 'b', 'c', 'd', 'e'];
        const reducer: ReducerWithBrakeCallback<string, string> = (acc, curr) => acc + curr;
        const shouldBreak: ShouldBreakCallback<string, string>  = (acc, curr) => acc.length >= 3;
        const initialValue = '';

        const result = reduceWithBreakSync(arr, reducer, shouldBreak, initialValue);
        expect(result).to.equal('abc');
    });

  });
});

