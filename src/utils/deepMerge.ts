// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (value: any): value is object => value !== null && typeof value === 'object';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepMerge = (source: Record<string, any>, target: Record<string, any>): Record<string, any> => {
  const base = { ...source };

  const targetEntries = Object.entries(target);

  return targetEntries.reduce((result, [key, value]) => {
    if (isObject(value)) {
      const childTarget: object = result[key];

      return Object.assign(result, { [key]: deepMerge(childTarget, value) });
    }

    if (result[key] !== undefined) {
      return result;
    }

    return Object.assign(result, { [key]: value });
  }, base);
};

export default deepMerge;
