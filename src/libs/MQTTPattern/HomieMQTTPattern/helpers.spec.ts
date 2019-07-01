import { clean, fill, matches, extract, exec } from './helpers';

describe('lib/MQTTPattern/HomieMQTTPattern/helpers', () => {
  test('cleans the pattern', () => {
    expect(clean('hello/+param1/world/#param2')).toEqual('hello/+/world/#');
    expect(clean('hello/+/world/#')).toEqual('hello/+/world/#');
    expect(clean('hello/$+param1/world/#param2')).toEqual('hello/+/world/#');
    expect(clean('hello/$+param1/world/$#param2')).toEqual('hello/+/world/$#param2');
  });

  test('fills the pattern with provided params', () => {
    expect(fill('+name/+property', { name: 'test' })).toBe('test/+property');
    expect(fill('+name/#property', { name: 'test' })).toBe('test/#property');
    expect(fill('+name/#property', { property: 'test' })).toBe('+name/test');
    expect(fill('+name/#property', { property: ['test0', 'test1'] })).toBe('+name/test0/test1');
    expect(fill('+name/$+property', { name: 'test', property: 'testProp' })).toBe('test/$testProp');
    expect(fill('+name/$+property', { name: 'test' })).toBe('test/$+property');
    expect(fill('+name/$#property', { name: 'test', property: ['testProp0', 'testProp1'] })).toBe('test/$#property');
  });

  test('checks if topic matches the pattern', () => {
    expect(matches('foo/bar/baz', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/bar/baz', 'baz/bar/foo')).toBeFalsy();
    expect(matches('#', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/#', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/bar/#', 'foo/bar')).toBeTruthy();
    expect(matches('#/bar/baz', 'foo/bar/baz')).toBeFalsy();
    expect(matches('+/bar/baz', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/bar/+', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/+/baz', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/+/#', 'foo/bar/baz')).toBeTruthy();
    expect(matches('foo/+something/#else', 'foo/bar/baz')).toBeTruthy();
    expect(matches('/foo/bar', '/foo/bar')).toBeTruthy();
    expect(matches('/foo/bar', '/bar/foo')).toBeFalsy();
    expect(matches('+name/$+property', 'myName/$prop1')).toBeTruthy();
    expect(matches('+name/$+property', 'myName/prop1')).toBeFalsy();
    expect(matches('/foo/bar', '/foo/bar/baz')).toBeFalsy();
    expect(matches('/foo/bar/baz', '/foo/bar')).toBeFalsy();
  });

  test('extracts the params from a topic given a pattern', () => {
    expect(extract('foo/bar/baz', 'foo/bar/baz')).toEqual({});
    expect(extract('foo/+/#', 'foo/bar/baz')).toEqual({});
    expect(extract('foo/#something', 'foo/bar/baz')).toEqual({
      something: ['bar', 'baz'],
    });
    expect(extract('foo/+hello/+world', 'foo/bar/baz')).toEqual({
      hello: 'bar',
      world: 'baz',
    });
    expect(extract('foo/+hello/#world', 'foo/bar/baz')).toEqual({
      hello: 'bar',
      world: ['baz'],
    });
    expect(extract('+hello/+world/#wow', 'foo/bar/baz/fizz')).toEqual({
      hello: 'foo',
      world: 'bar',
      wow: ['baz', 'fizz'],
    });
    expect(extract('+hello/$+world/#wow', 'foo/$bar/baz/fizz')).toEqual({
      hello: 'foo',
      world: 'bar',
      wow: ['baz', 'fizz'],
    });
    expect(extract('+hello/$+world/#wow', 'foo/bar/baz/fizz')).toEqual({
      hello: 'foo',
      wow: ['baz', 'fizz'],
    });
  });

  test('extracts the params from a topic given a pattern', () => {
    expect(exec('foo/bar/baz', 'foo/bar/baz')).toEqual({});
    expect(exec('+hello/$+world/#wow', 'foo/$bar/baz/fizz')).toEqual({
      hello: 'foo',
      world: 'bar',
      wow: ['baz', 'fizz'],
    });
    expect(exec('+hello/$+world/#wow', 'foo/bar/baz/fizz')).toBeNull();
  });
});
