import { clean } from './helpers';
import HomieMQTTPattern from './HomieMQTTPattern';

describe('lib/MQTTPattern/HomieMQTTPattern/helpers', () => {
  it('has a cleanPattern property', () => {
    expect(new HomieMQTTPattern('hello/+param1/world/#param2').cleanPattern).toBe(clean('hello/+param1/world/#param2'));
    expect(new HomieMQTTPattern('hello/$+param1/world/#param2').cleanPattern).toBe(
      clean('hello/+param1/world/#param2'),
    );
    expect(new HomieMQTTPattern('hello/+/world/#').cleanPattern).toBe(clean('hello/+/world/#'));
  });

  describe('.matches', () => {
    it('checks if topic matches the pattern', () => {
      expect(new HomieMQTTPattern('foo/bar/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/bar/baz').matches('baz/bar/foo')).toBeFalsy();
      expect(new HomieMQTTPattern('#').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/#').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/bar/#').matches('foo/bar')).toBeTruthy();
      expect(new HomieMQTTPattern('#/bar/baz').matches('foo/bar/baz')).toBeFalsy();
      expect(new HomieMQTTPattern('+/bar/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/bar/+').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/+/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/+/#').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('foo/+something/#else').matches('foo/bar/baz')).toBeTruthy();
      expect(new HomieMQTTPattern('/foo/bar').matches('/foo/bar')).toBeTruthy();
      expect(new HomieMQTTPattern('/foo/bar').matches('/bar/foo')).toBeFalsy();
      expect(new HomieMQTTPattern('+name/$+property').matches('myName/$prop1')).toBeTruthy();
      expect(new HomieMQTTPattern('+name/$+property').matches('myName/prop1')).toBeFalsy();
      expect(new HomieMQTTPattern('/foo/bar').matches('/foo/bar/baz')).toBeFalsy();
      expect(new HomieMQTTPattern('/foo/bar/baz').matches('/foo/bar')).toBeFalsy();
    });
  });

  describe('.extract', () => {
    it('extracts the params from a topic', () => {
      expect(new HomieMQTTPattern('foo/bar/baz').extract('foo/bar/baz')).toEqual({});
      expect(new HomieMQTTPattern('foo/+/#').extract('foo/bar/baz')).toEqual({});
      expect(new HomieMQTTPattern('foo/#something').extract('foo/bar/baz')).toEqual({
        something: ['bar', 'baz'],
      });
      expect(new HomieMQTTPattern('foo/+hello/+world').extract('foo/bar/baz')).toEqual({
        hello: 'bar',
        world: 'baz',
      });
      expect(new HomieMQTTPattern('foo/+hello/#world').extract('foo/bar/baz')).toEqual({
        hello: 'bar',
        world: ['baz'],
      });
      expect(new HomieMQTTPattern('+hello/+world/#wow').extract('foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(new HomieMQTTPattern('+hello/$+world/#wow').extract('foo/$bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(new HomieMQTTPattern('+hello/$+world/#wow').extract('foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        wow: ['baz', 'fizz'],
      });
    });
  });

  describe('.exec', () => {
    it('extracts the params if the  topic matches', () => {
      expect(new HomieMQTTPattern('foo/bar/baz').exec('foo/bar/baz')).toEqual({});
      expect(new HomieMQTTPattern('+hello/$+world/#wow').exec('foo/$bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(new HomieMQTTPattern('+hello/$+world/#wow').exec('foo/bar/baz/fizz')).toBeNull();
    });
  });

  describe('.fill', () => {
    it('fills the pattern with provided params', () => {
      expect(new HomieMQTTPattern('+name/+property').fill({ name: 'test' })).toBe('test/+property');
      expect(new HomieMQTTPattern('+name/#property').fill({ name: 'test' })).toBe('test/#property');
      expect(new HomieMQTTPattern('+name/#property').fill({ property: 'test' })).toBe('+name/test');
      expect(new HomieMQTTPattern('+name/#property').fill({ property: ['test0', 'test1'] })).toBe('+name/test0/test1');
      expect(new HomieMQTTPattern('+name/$+property').fill({ name: 'test', property: 'testProp' })).toBe(
        'test/$testProp',
      );
      expect(new HomieMQTTPattern('+name/$+property').fill({ name: 'test' })).toBe('test/$+property');
      expect(
        new HomieMQTTPattern('+name/$#property').fill({ name: 'test', property: ['testProp0', 'testProp1'] }),
      ).toBe('test/$#property');
    });
  });

  describe('.fillPattern', () => {
    it('fills and return a new pattern', () => {
      expect(new HomieMQTTPattern('+name/+property').fillPattern({ name: 'test' })).toEqual(
        new HomieMQTTPattern('test/+property'),
      );
      expect(new HomieMQTTPattern('+name/#property').fillPattern({ name: 'test' })).toEqual(
        new HomieMQTTPattern('test/#property'),
      );
      expect(new HomieMQTTPattern('+name/#property').fillPattern({ property: 'test' })).toEqual(
        new HomieMQTTPattern('+name/test'),
      );
      expect(new HomieMQTTPattern('+name/#property').fillPattern({ property: ['test0', 'test1'] })).toEqual(
        new HomieMQTTPattern('+name/test0/test1'),
      );
      expect(new HomieMQTTPattern('+name/$+property').fillPattern({ name: 'test', property: 'testProp' })).toEqual(
        new HomieMQTTPattern('test/$testProp'),
      );
      expect(new HomieMQTTPattern('+name/$+property').fillPattern({ name: 'test' })).toEqual(
        new HomieMQTTPattern('test/$+property'),
      );
      expect(
        new HomieMQTTPattern('+name/$#property').fillPattern({ name: 'test', property: ['testProp0', 'testProp1'] }),
      ).toEqual(new HomieMQTTPattern('test/$#property'));
    });
  });
});
