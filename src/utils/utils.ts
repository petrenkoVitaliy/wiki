export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const pickedObj: { [key in K]?: T[K] } = {};

  keys.forEach((key) => {
    pickedObj[key] = obj[key];
  });

  return pickedObj as Pick<T, K>;
};

export const notEmptyWithPredicate =
  <T>(predicate: (element: T) => boolean) =>
  (element: T | null | undefined): element is T => {
    return element !== null && element !== undefined && predicate(element);
  };

export const convertNameToCode = (name: string) => {
  return name.toLowerCase().split(' ').join('_');
};

export const prettyPrint = (data: object) => {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
};
