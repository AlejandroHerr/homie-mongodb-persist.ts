import deepMerge from './deepMerge';

describe('utils/deepMerge', () => {
  it('should merge two flat objects', () => {
    const source = {
      baz: 'bazValue',
      foo: 'fooValue',
    };
    const target = {
      bar: 'barValue',
      foo: 'fuhValue',
    };

    expect(deepMerge(target, source)).toEqual({ ...source, ...target });
  });

  it('should merge two deep objects objects', () => {
    const source = {
      baq: {
        baq1: 'bak1Value',
        baq2: 'baq2Value',
      },
      baz: 'bazValue',
      foo: 'fooValue',
    };
    const target = {
      baq: {
        baq1: 'baq1Value',
        baq3: 'baq3Value',
      },
      bar: 'barValue',
      foo: { foo1: 'foo1Value' },
    };

    expect(deepMerge(target, source)).toEqual({
      ...source,
      ...target,
      baq: {
        ...source.baq,
        ...target.baq,
      },
    });
  });
});
