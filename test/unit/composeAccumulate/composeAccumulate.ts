import { expect } from 'chai';
import { composeAccumulate } from '../../../src/utils/ramda';

describe('composeAccumulate with property accumulation', () => {
    it('accumulates results across functions, retaining all properties', async () => {
        const fn1 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const fn2 = async ({ a, b }: { a: number; b: number }) => ({ c: b + 1 });
        const composedFunction = composeAccumulate(fn1, fn2);

        const result = await composedFunction({ a: 5 });
        expect(result).to.deep.equal({ a: 5, b: 10, c: 11 });
    });

    it('accumulates results with async and sync functions mixed', async () => {
        const fn1 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const fn2 = ({ a, b }: { a: number; b: number }) => ({ c: a + b });
        const composedFunction = composeAccumulate(fn1, fn2);

        const result = await composedFunction({ a: 3 });
        expect(result).to.deep.equal({ a: 3, b: 6, c: 9 });
    });

    it('handles functions that do not add properties', async () => {
        const fn1 = async ({ a }: { a: number }) => ({});
        const fn2 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const fn3 = async ({ b }: { b: number }) => ({ c: b + 1 });
        const composedFunction = composeAccumulate(fn1, fn2, fn3);

        const result = await composedFunction({ a: 4 });
        expect(result).to.deep.equal({ a: 4, b: 8, c: 9 });
    });

    it('handles functions that interrupt the process', async () => {
        const fn1 = async ({ a }: { a: number }) => ({});
        const fn2 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const preventsThrow = ({ b }: { b: number }) => undefined;
        const throws = async ({ b }: { b: number }) => {
            throw new Error("Error should not be raised")
        };
        const composedFunction = composeAccumulate(fn1, fn2, preventsThrow, throws);

        const result = await composedFunction({ a: 4 });
        console.log("eeeeeeee", result)
        expect(result).to.deep.equal(undefined);
    });

    it('handles functions that interrupt the process in a promise', async () => {
        const fn1 = async ({ a }: { a: number }) => ({});
        const fn2 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const preventsThrow = async ({ b }: { b: number }) => {
            await new Promise(r => setTimeout(r, 800));
            return undefined;
        };
        const throws = async ({ b }: { b: number }) => {
            throw new Error("Error should not be raised")
        };
        const composedFunction = composeAccumulate(fn1, fn2, preventsThrow, throws);

        const result = await composedFunction({ a: 4 });
        console.log("eeeeeeee", result)
        expect(result).to.deep.equal(undefined);
    });

    it('handles functions that directly interrupt', async () => {
        const fn1 = ({ a }: { a: number }) => undefined;
        const fn2 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const preventsThrow = async ({ b }: { b: number }) => {
            await new Promise(r => setTimeout(r, 800));
            return undefined;
        };
        const throws = async ({ b }: { b: number }) => {
            throw new Error("Error should not be raised")
        };
        const composedFunction = composeAccumulate(fn1, fn2, preventsThrow, throws);

        const result = await composedFunction({ a: 4 });
        console.log("eeeeeeee", result)
        expect(result).to.deep.equal(undefined);
    });

    it('handles functions that directly interrupt on a promise', async () => {
        const directlyInterrupts = async ({ a }: { a: number }) => {
            await new Promise(r => setTimeout(r, 800));
            return undefined;
        };
        const fn2 = async ({ a }: { a: number }) => ({ b: a * 2 });
        const preventsThrow = async ({ b }: { b: number }) => {
            await new Promise(r => setTimeout(r, 800));
            return undefined;
        };
        const throws = async ({ b }: { b: number }) => {
            throw new Error("Error should not be raised")
        };
        const composedFunction = composeAccumulate(directlyInterrupts, fn2, preventsThrow, throws);

        const result = await composedFunction({ a: 4 });
        console.log("eeeeeeee", result)
        expect(result).to.deep.equal(undefined);
    });

    it('accumulates results when intermediate functions conditionally add properties', async () => {
        const fn1 = async ({ a }: { a: number }) => a > 5 ? { b: a - 5 } : {};
        const fn2 = async ({ a, b }: { a: number; b?: number }) => ({ c: (b || a) + 1 });
        const fn3 = async ({ c }: { c: number }) => ({ d: c * 2 });
        const composedFunction = composeAccumulate(fn1, fn2, fn3);

        const resultForA5 = await composedFunction({ a: 5 });
        const resultForA10 = await composedFunction({ a: 10 });

        // For a: 5, b should not exist, and c is based on a
        expect(resultForA5).to.deep.equal({ a: 5, c: 6, d: 12 });
        // For a: 10, b exists and c is based on b
        expect(resultForA10).to.deep.equal({ a: 10, b: 5, c: 6, d: 12 });
    });

    it('accumulates results when they are string properties', async () => {
      // Function 1: Takes an object with a 'name' property and returns an object with a 'greeting' property
      const f21 = ({ name }: { name: string }) => ({ greeting: `Hello, ${name}` });
      // Function 2: Takes an object with a 'greeting' property and optionally a 'name', and returns an object with a 'farewell' property
      const f22 = ({ greeting, name }: { greeting: string; name?: string }) => ({ farewell: `${greeting}. Goodbye, ${name ?? "stranger"}` });
      const composedFunction = composeAccumulate(f21, f22);
      const result = composedFunction({ name: "John" });
      expect(result).to.deep.equal({
        farewell: "Hello, John. Goodbye, John",
        greeting: "Hello, John",
        name: "John",
      });
    });

    it('accumulates results across synchronous functions', () => {
        const fn1 = ({ a }: { a: number }) => ({ b: a + 10 });
        const fn2 = ({ a, b }: { a: number; b: number }) => ({ c: b * 2 });
        const composedFunction = composeAccumulate(fn1, fn2);
        const result = composedFunction({ a: 5 });
        expect(result).to.deep.equal({ a: 5, b: 15, c: 30 });
    });
});

describe('composeAccumulate with an intermediate function that produces a new object', () => {
    it('properly accumulates results when an intermediate function ignores previous output', async () => {
        const function1 = async ({ a }: { a: number }) => ({ b: a * 2 });
        // Intermediate function that ignores input and produces a new object
        const intermediateFunction = async () => ({ c: 100 });
        const function3 = async ({ b, c }: { b?: number; c: number }) => ({ d: (b || 0) + c });

        const composedFunction = composeAccumulate(function1, intermediateFunction, function3);

        const result = await composedFunction({ a: 5 });
        // Expect that the result includes the produced object from the intermediate function,
        // and the final output depends on this object.
        expect(result).to.deep.equal({ a: 5, b: 10, c: 100, d: 110 });
    });
});

describe('composeAccumulate with mixed functions and async delay', () => {
    it('handles async function with 500ms delay followed by a sync function', async () => {
        const asyncFunctionWithDelay = async ({ a }: { a: number }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { b: a * 2 };
        };
        const syncFunction = ({ a, b }: { a: number; b: number }) => {
            return { c: b + 3 };
        };
        const composedFunction = composeAccumulate(asyncFunctionWithDelay, syncFunction);
        const result = await composedFunction({ a: 1 });
        expect(result).to.deep.equal({ a: 1, b: 2, c: 5 });
    });

    it('combines multiple async functions with delays', async () => {
        const asyncFunction1 = async ({ a }: { a: number }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { b: a + 1 };
        };
        const asyncFunction2 = async ({ b }: { b: number }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { c: b * 2 };
        };
        const composedFunction = composeAccumulate(asyncFunction1, asyncFunction2);

        const startTime = Date.now();
        const result = await composedFunction({ a: 2 });
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify the results are as expected
        expect(result).to.deep.equal({ a: 2, b: 3, c: 6 });
        // Verify that it took at least approximately 1000ms due to the async delays
        expect(duration).to.be.greaterThan(1000 - 100); // Allowing a 50ms margin for the test environment's timing inaccuracies
    });

    it('combines multiple properly', async () => {
        const functionA = (input: { a: number }) => ({ b: input.a * 2 });
        const functionB = (input: { b: string }) => ({ c: `Value: ${input.b}` });
        const b = composeAccumulate(functionA, functionB); // TypeScript Error: functionB expects 'b' to be a string, but functionA returns it as a number
        /* const b: (initialArg: {
        a: number;
        }) => Promise<{
            b: number;
        } & {
            c: string;
        }> */
        const c = await b({ a: 10 });
        /*
        const c: Promise<{
        b: number;
        } & {
            c: string;
        }> */
        expect(c).to.deep.equal({ a: 10, b: 20, c: "Value: 20" });
    });

});