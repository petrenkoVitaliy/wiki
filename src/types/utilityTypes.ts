export type Conditional<T extends boolean, A1, A2> = T extends true ? A1 : A2;

export type Argument<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends (...args: any) => any,
  Index extends number,
> = Parameters<Fn>[Index];
