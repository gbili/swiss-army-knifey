import { expect } from 'chai';
import { distribute, group, ReducerWithBrakeCallback, reduceWithBreakSync, ShouldBreakCallback, splitBy, unmerge } from '../../src/utils/array';

describe('pad', function () {
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

    // ---- splitBy Tests ----
    describe('splitBy', () => {
      it('should split array into matching and non-matching elements', () => {
        const array = [1, 2, 3, 4, 5];
        const [selected, unselected] = splitBy(array, (n) => n > 3);
        expect(selected).to.deep.equal([4, 5]);
        expect(unselected).to.deep.equal([1, 2, 3]);
      });

      it('should throw an error if no elements match and allowEmpty is false', () => {
        const array = [1, 2, 3];
        expect(() => splitBy(array, (n) => n > 5, false)).to.throw('No elements match filter');
      });

      it('should return empty array if allowEmpty is true and no match', () => {
        const array = [1, 2, 3];
        const [selected, unselected] = splitBy(array, (n) => n > 5, true);
        expect(selected).to.deep.equal([]);
        expect(unselected).to.deep.equal([1, 2, 3]);
      });
    });

    // ---- distribute Tests ----
    describe('distribute', () => {
      it('should distribute elements into buckets based on filter keys', () => {
        const array = [1, 2, 3, 4, 5, 6, 7];
        const result = distribute(array, (n) => {
          if (n <= 3) return 0;
          if (n <= 6) return 1;
          return 2;
        });
        expect(result[0]).to.deep.equal([1, 2, 3]);
        expect(result[1]).to.deep.equal([4, 5, 6]);
        expect(result[2]).to.deep.equal([7]);
      });

      it('should return an empty distribution for an empty array', () => {
        const array: number[] = [];
        const result = distribute(array, () => 0);
        expect(result).to.deep.equal([]);
      });

      it('should handle non-sequential keys correctly', () => {
        const array = [1, 2, 3];
        // Return key 2 for elements 1 and 3, and key 5 for element 2.
        const result = distribute(array, (n) => (n === 1 || n === 3 ? 2 : 5));
        expect(result[2]).to.deep.equal([1, 3]);
        expect(result[5]).to.deep.equal([2]);
        // Ensure that indices with no assigned elements are undefined.
        expect(result[0]).to.equal(undefined);
        expect(result[1]).to.equal(undefined);
        expect(result[3]).to.equal(undefined);
        expect(result[4]).to.equal(undefined);
      });
    });

    // ---- unmerge Tests ----
    describe('unmerge', () => {
      it('should split array into two parts based on the callback', () => {
        const array = [1, 2, 3, 4, 5];
        const [selected, unselected] = unmerge(array, (n) => n % 2 === 0);
        expect(selected).to.deep.equal([2, 4]);
        expect(unselected).to.deep.equal([1, 3, 5]);
      });

      it('should return both arrays empty if input is empty', () => {
        const array: number[] = [];
        const [selected, unselected] = unmerge(array, (n) => n > 0);
        expect(selected).to.deep.equal([]);
        expect(unselected).to.deep.equal([]);
      });
    });

    // ---- group Tests ----
    describe('group', () => {
      it('should group elements by a specified key', () => {
        const array = [
          { id: 1, type: 'fruit', name: 'apple' },
          { id: 2, type: 'vegetable', name: 'carrot' },
          { id: 3, type: 'fruit', name: 'banana' },
        ];

        const result = group(array, (item) => item.type);
        expect(result).to.deep.equal({
          fruit: [
            { id: 1, type: 'fruit', name: 'apple' },
            { id: 3, type: 'fruit', name: 'banana' },
          ],
          vegetable: [
            { id: 2, type: 'vegetable', name: 'carrot' },
          ],
        });
      });

      it('should return an empty object if array is empty', () => {
        const array: any[] = [];
        const result = group(array, (item) => item.type);
        expect(result).to.deep.equal({});
      });

      it('should handle duplicate keys correctly', () => {
        const array = ['apple', 'banana', 'apricot'];
        const result = group(array, (item) => item[0]); // Group by first letter
        expect(result).to.deep.equal({
          a: ['apple', 'apricot'],
          b: ['banana'],
        });
      });
    });
});

