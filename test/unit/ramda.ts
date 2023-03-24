import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { toString } from 'ramda';
import { arraySum, getArrayFromZeroOfLengthN, sleep, TimeUnit } from '../../src';
import { composeWithPromise } from '../../src/utils/ramda';

chai.use(chaiAsPromised);

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

