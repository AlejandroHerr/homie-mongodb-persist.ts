import asyncSetTimeout from './asyncSetTimeout';

describe('asyncSetTimeout', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('waits 1 second by default besfore resolving', async () => {
    const promise = asyncSetTimeout();

    jest.runAllTimers();

    await expect(promise).resolves.toBeUndefined();

    expect(setTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  it('waits the given time besfore resolving', async () => {
    const promise = asyncSetTimeout(100);

    jest.runAllTimers();

    await expect(promise).resolves.toBeUndefined();

    expect(setTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
  });
});
