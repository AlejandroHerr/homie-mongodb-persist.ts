export default <R, S>(
  array: S[],
  reduceFn: (previousValue: R, currentValue: S, currentIndex: number) => Promise<R>,
  initialValue: R,
) =>
  array.reduce(
    (previousValue: Promise<R>, currentValue: S, currentIndex) =>
      previousValue.then((accumulator: R) => reduceFn(accumulator, currentValue, currentIndex)),
    Promise.resolve(initialValue),
  );
