export default (ms: number): Promise<void> =>
  new Promise(
    (resolve): void => {
      setTimeout(resolve, ms);
    },
  );
