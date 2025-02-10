import { expect } from 'chai';
import { compose } from '../../src/utils/compose';

describe('compose', () => {
  it('should return an identity function when no functions are provided', () => {
    const id = compose();
    // Identity: returns its argument
    expect(id(42)).to.equal(42);
    expect(id('hello')).to.equal('hello');
  });

  it('should return the same function when only one function is provided', () => {
    const addOne = (x: number) => x + 1;
    const composed = compose(addOne);
    expect(composed(5)).to.equal(6);
  });

  it('should compose two functions in right-to-left order', () => {
    const addOne = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    // compose(double, addOne) should compute double(addOne(x))
    const composed = compose(double, addOne);
    // For x = 3: addOne(3)=4, double(4)=8.
    expect(composed(3)).to.equal(8);
  });

  it('should compose three functions correctly', () => {
    const addOne = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const subtractThree = (x: number) => x - 3;
    // Expected composition: subtractThree(double(addOne(x)))
    // For x = 4: addOne(4)=5, double(5)=10, subtractThree(10)=7.
    const composed = compose(subtractThree, double, addOne);
    expect(composed(4)).to.equal(7);
  });

  it('should forward multiple arguments to the rightmost function', () => {
    // f1 accepts two arguments.
    const sum = (a: number, b: number) => a + b;
    const double = (x: number) => x * 2;
    // compose(double, sum) should compute double(sum(a,b))
    const composed = compose(double, sum);
    expect(composed(2, 3)).to.equal(10); // 2+3=5, 5*2=10
  });

  it('should compose functions with mixed types', () => {
    // Convert string to number.
    const toNumber = (s: string) => parseInt(s, 10);
    // Add 100 to the number.
    const addHundred = (n: number) => n + 100;
    // Convert number back to a formatted string.
    const format = (n: number) => `Result: ${n}`;
    const composed = compose(format, addHundred, toNumber);
    expect(composed("23")).to.equal('Result: 123');
  });

  it('should correctly compose more than three functions', () => {
    const f1 = (x: number) => x + 1;
    const f2 = (x: number) => x * 3;
    const f3 = (x: number) => x - 2;
    const f4 = (x: number) => x / 2;
    // Composition: f4(f3(f2(f1(x))))
    // For x = 2: f1(2)=3, f2(3)=9, f3(9)=7, f4(7)=3.5.
    const composed = compose(f4, f3, f2, f1);
    expect(composed(2)).to.equal(3.5);
  });
});
