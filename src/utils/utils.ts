export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const pickedObj: any = {};

  keys.forEach((key) => {
    pickedObj[key] = obj[key];
  });

  return pickedObj;
};

export const convertNullable = <T, P>(
  value: T | null | undefined,
  convert: (value: T) => P,
) => {
  if (value) {
    return convert(value);
  }

  return null;
};

export const notEmptyWithPredicate =
  <T>(predicate: (element: T) => boolean) =>
  (element: T | null | undefined): element is T => {
    return element !== null && element !== undefined && predicate(element);
  };

export const convertNameToCode = (name: string) => {
  return name.toLowerCase().split(' ').join('_');
};
