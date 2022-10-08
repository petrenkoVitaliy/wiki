export type Conditional<T extends boolean, A1, A2> = T extends true ? A1 : A2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Argument<Fn extends (args: any) => any> = Parameters<Fn>[0];
