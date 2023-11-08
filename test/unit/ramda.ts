import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { toString } from 'ramda';
import { arraySum, getArrayFromZeroOfLengthN, sleep, TimeUnit } from '../../src';
import { combineReturns, composeWithPromise, simpleCombineReturns } from '../../src/utils/ramda';

chai.use(chaiAsPromised);

describe(`ramda style`, function() {
describe(`composeWithPromise(few functions)`, function() {

  it('should await and return a composed result', async function() {
    const paramToProp = (param: string) => ({ param });
    const sleepingSentence = (s: number) => async ({ param }: { param: string }) => {
      const d1 = new Date();
      await sleep(s, TimeUnit.second);
      const d2 = new Date();
      return `a_[${param}], slept for: ${d2.getTime() - d1.getTime()}`;
    };
    const toUp = async (param: string) => param.toUpperCase();
    const removeStart = async (param: string) => param.slice(1);
    const composed = composeWithPromise(
      removeStart,
      sleepingSentence(1),
      paramToProp,
      toUp,
      sleepingSentence(2),
      paramToProp
    );
    return expect(composed('hey')).to.eventually.match(/_\[A_\[HEY\], SLEPT FOR: \d{4}\], slept for: \d{3,4}$/g);
  });

  it('should be able to compose non async functions', async function() {
    const paramToProp = (param: string) => ({ param });
    const toUp = (param: string) => param.toUpperCase();
    const removeFirst = ({ param }: { param: string }) => param.slice(1);
    const composed = composeWithPromise(
      removeFirst,
      paramToProp,
      toUp,
      toString
    );
    return expect(composed(3.14159)).to.equal('.14159');
  });

  it('should handle arrays of promises', async function() {
    // [1, 2, 3] -> [Promise 1, Promise 4, Promise 9]
    const asyncSquare = (ns: number[]) => {
      return ns.map(async n => {
        await sleep(1, TimeUnit.second);
        return n * n;
      })
    };
    // [1, 4, 9] -> [0, 6, 45]
    const asyncSum = (ns: number[]) => {
      return ns
        // [1, 4, 9]
        .map(getArrayFromZeroOfLengthN)
        // [[0], [0, 1, 2, 3], [0, 1, 2, 3, 4, 5, 6, 7, 8]]
        .map(async (arr: number[]) => {
          await sleep(1, TimeUnit.second);
          return arraySum(arr);
        });
        // [0, 6, 36]
    };
    const composed = composeWithPromise(
      asyncSum,
      asyncSquare,
    );

    return expect(composed([1, 2, 3])).to.eventually.deep.equal([0, 6, 36]);
  });

  it('should handle rejections', async function() {
    // [1, 2, 3] -> [Promise 1, Promise 4, Promise 9]
    const asyncSquare = (ns: number[]) => {
      return ns.map(async n => {
        await sleep(1, TimeUnit.second);
        return n * n;
      })
    };
    // [1, 4, 9] -> [0, 6, 45]
    const asyncSum = (ns: number[]) => {
      return ns
        // [1, 4, 9]
        .map(getArrayFromZeroOfLengthN)
        // [[0], [0, 1, 2, 3], [0, 1, 2, 3, 4, 5, 6, 7, 8]]
        .map(async (arr: number[]) => {
          await sleep(1, TimeUnit.second);
          throw new Error('Woho rejected promise');
        });
        // [0, 6, 36]
    };

    const composed = composeWithPromise(
      asyncSum,
      asyncSquare,
    );

    return expect(composed([1, 2, 3])).to.eventually.be.rejectedWith('Woho rejected promise');
  });
});

  describe('simpleCombineReturns', () => {

    it('should combine results of promise-returning functions with sleep delay', async () => {
      const fn1 = async (num: number) => {
        await sleep(1, TimeUnit.second);
        return { value1: num + 1 };
      };
      const fn2 = async (num: number) => {
        await sleep(1, TimeUnit.second);
        return { value2: num * 2 };
      };

      const startTime = Date.now();
      const result = await simpleCombineReturns([fn1, fn2], 10);
      const endTime = Date.now();

      expect(result).to.deep.equal({ value1: 11, value2: 20 });
      expect(endTime - startTime).to.be.greaterThan(1000); // Check that at least 1 second has passed
    });

    it('should combine results of functions taking string inputs', async () => {
      const fn1 = async (str: string) => {
        await sleep(1, TimeUnit.second);
        return { upper: str.toUpperCase() };
      };
      const fn2 = async (str: string) => {
        await sleep(1, TimeUnit.second);
        return { length: str.length };
      };

      const result = await simpleCombineReturns([fn1, fn2], "test");
      expect(result).to.deep.equal({ upper: "TEST", length: 4 });
    });

    it('should combine results of functions returning different types', async () => {
      const fn1 = async (value: number) => {
        await sleep(1, TimeUnit.second);
        return { boolValue: value > 10 };
      };
      const fn2 = async (value: number) => {
        await sleep(1, TimeUnit.second);
        return { stringValue: `Value is ${value}` };
      };

      const result = await simpleCombineReturns([fn1, fn2], 15);
      expect(result).to.deep.equal({ boolValue: true, stringValue: "Value is 15" });
    });
  });

  describe('combineReturns', () => {
    it('should combine results of curried promise-returning functions with sleep delay', async () => {
      const fn1 = async (num: number) => {
        await sleep(1, TimeUnit.second);
        return { value1: num + 1 };
      };
      const fn2 = async (num: number) => {
        await sleep(1, TimeUnit.second);
        return { value2: num * 2 };
      };

      const combined = combineReturns([fn1, fn2]);
      const startTime = Date.now();
      const result = await combined(10);
      const endTime = Date.now();

      expect(result).to.deep.equal({ value1: 11, value2: 20 });
      expect(endTime - startTime).to.be.greaterThan(1000); // Check that at least 1 second has passed
    });

    it('should combine results of curried functions taking string inputs', async () => {
      const fn1 = async (str: string) => {
        await sleep(1, TimeUnit.second);
        return { upper: str.toUpperCase() };
      };
      const fn2 = async (str: string) => {
        await sleep(1, TimeUnit.second);
        return { length: str.length };
      };

      const combined = combineReturns([fn1, fn2]);
      const result = await combined("test");
      expect(result).to.deep.equal({ upper: "TEST", length: 4 });
    });

    it('should combine results of curried functions returning different types', async () => {
      const fn1 = async (value: number) => {
        await sleep(1, TimeUnit.second);
        return { boolValue: value > 10 };
      };
      const fn2 = async (value: number) => {
        await sleep(1, TimeUnit.second);
        return { stringValue: `Value is ${value}` };
      };

      const combined = combineReturns([fn1, fn2]);
      const result = await combined(15);
      expect(result).to.deep.equal({ boolValue: true, stringValue: "Value is 15" });
    });
  });

});