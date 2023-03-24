import * as R from "ramda";

declare module "ramda" {
  export function composeWith<TArgs extends any[], TResult, T extends (fn: (...args: any[]) => any, intermediateResult: any) => any>
    (transformer: T extends (fn: (...args: any[]) => any, intermediateResult: any) => infer Z ? (fn: (...args: any[]) => any, intermediateResult: any) => Z : never, fns: R.AtLeastOneFunctionsFlowFromRightToLeft<TArgs, TResult>): (...args: TArgs) => ReturnType<T>;
}