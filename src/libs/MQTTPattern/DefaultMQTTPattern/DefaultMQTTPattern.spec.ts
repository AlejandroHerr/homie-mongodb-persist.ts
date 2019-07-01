import DefaultMQTTPattern from './DefaultMQTTPattern';
import { clean } from './helpers';

describe('lib/MQTTPattern/DefaultMQTTPattern/DefaultMQTTPattern', () => {
  it('has a cleanPattern property', () => {
    expect(new DefaultMQTTPattern('hello/+param1/world/#param2').cleanPattern).toBe(
      clean('hello/+param1/world/#param2'),
    );
    expect(new DefaultMQTTPattern('hello/+/world/#').cleanPattern).toBe(clean('hello/+/world/#'));
  });

  describe('.matches', () => {
    it('checks if topic matches the pattern', () => {
      expect(new DefaultMQTTPattern('foo/bar/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/bar/baz').matches('baz/bar/foo')).toBeFalsy();
      expect(new DefaultMQTTPattern('#').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/#').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/bar/#').matches('foo/bar')).toBeTruthy();
      expect(new DefaultMQTTPattern('#/bar/baz').matches('foo/bar/baz')).toBeFalsy();
      expect(new DefaultMQTTPattern('+/bar/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/bar/+').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/+/baz').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/+/#').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('foo/+something/#else').matches('foo/bar/baz')).toBeTruthy();
      expect(new DefaultMQTTPattern('/foo/bar').matches('/foo/bar')).toBeTruthy();
      expect(new DefaultMQTTPattern('/foo/bar').matches('/bar/foo')).toBeFalsy();
      expect(new DefaultMQTTPattern('/foo/bar').matches('/foo/bar/baz')).toBeFalsy();
      expect(new DefaultMQTTPattern('/foo/bar/baz').matches('/foo/bar')).toBeFalsy();
    });
  });

  describe('.extract', () => {
    it('extracts the params from a topic', () => {
      expect(new DefaultMQTTPattern('foo/bar/baz').extract('foo/bar/baz')).toEqual({});
      expect(new DefaultMQTTPattern('foo/+/#').extract('foo/bar/baz')).toEqual({});
      expect(new DefaultMQTTPattern('foo/#something').extract('foo/bar/baz')).toEqual({
        something: ['bar', 'baz'],
      });
      expect(new DefaultMQTTPattern('foo/+hello/+world').extract('foo/bar/baz')).toEqual({
        hello: 'bar',
        world: 'baz',
      });
      expect(new DefaultMQTTPattern('foo/+hello/#world').extract('foo/bar/baz')).toEqual({
        hello: 'bar',
        world: ['baz'],
      });
      expect(new DefaultMQTTPattern('+hello/+world/#wow').extract('foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
    });
  });

  describe('.exec', () => {
    it('extracts the params if the  topic matches', () => {
      expect(new DefaultMQTTPattern('foo/bar/baz').exec('foo/bar/baz')).toEqual({});
      expect(new DefaultMQTTPattern('+hello/+world/#wow').exec('foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(new DefaultMQTTPattern('hello/+world/#wow').exec('foo/bar/baz/fizz')).toBeNull();
    });
  });

  describe('.fill', () => {
    it('fills the pattern with provided params', () => {
      expect(new DefaultMQTTPattern('+name/+property').fill({ name: 'test' })).toBe('test/+property');
      expect(new DefaultMQTTPattern('+name/#property').fill({ name: 'test' })).toBe('test/#property');
      expect(new DefaultMQTTPattern('+name/#property').fill({ property: 'test' })).toBe('+name/test');
      expect(new DefaultMQTTPattern('+name/#property').fill({ property: ['test0', 'test1'] })).toBe(
        '+name/test0/test1',
      );
    });
  });

  describe('.fillPattern', () => {
    it('fills and return a new pattern', () => {
      expect(new DefaultMQTTPattern('+name/+property').fillPattern({ name: 'test' })).toEqual(
        new DefaultMQTTPattern('test/+property'),
      );
      expect(new DefaultMQTTPattern('+name/#property').fillPattern({ name: 'test' })).toEqual(
        new DefaultMQTTPattern('test/#property'),
      );
      expect(new DefaultMQTTPattern('+name/#property').fillPattern({ property: 'test' })).toEqual(
        new DefaultMQTTPattern('+name/test'),
      );
      expect(new DefaultMQTTPattern('+name/#property').fillPattern({ property: ['test0', 'test1'] })).toEqual(
        new DefaultMQTTPattern('+name/test0/test1'),
      );
    });
  });
});
