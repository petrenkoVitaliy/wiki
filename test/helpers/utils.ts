// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortAny = (array: any[]) => {
  return array.sort((a, b) => (a !== b ? (a < b ? -1 : 1) : 0));
};
