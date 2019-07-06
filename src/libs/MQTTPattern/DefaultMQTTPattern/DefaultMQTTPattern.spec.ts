import DefaultMQTTPattern from './DefaultMQTTPattern';
import { clean } from './helpers';

describe('lib/MQTTPattern/DefaultMQTTPattern/DefaultMQTTPattern', () => {
  it('has a cleanPattern property', () => {
    expect(DefaultMQTTPattern.clean('hello/+param1/world/#param2')).toBe(clean('hello/+param1/world/#param2'));
    expect(DefaultMQTTPattern.clean('hello/+/world/#')).toBe(clean('hello/+/world/#'));
  });

  describe('.matches', () => {
    it('checks if topic matches the pattern', () => {
      expect(DefaultMQTTPattern.matches('foo/bar/baz', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/bar/baz', 'baz/bar/foo')).toBeFalsy();
      expect(DefaultMQTTPattern.matches('#', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/#', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/bar/#', 'foo/bar')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('#/bar/baz', 'foo/bar/baz')).toBeFalsy();
      expect(DefaultMQTTPattern.matches('+/bar/baz', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/bar/+', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/+/baz', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/+/#', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('foo/+something/#else', 'foo/bar/baz')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('/foo/bar', '/foo/bar')).toBeTruthy();
      expect(DefaultMQTTPattern.matches('/foo/bar', '/bar/foo')).toBeFalsy();
      expect(DefaultMQTTPattern.matches('/foo/bar', '/foo/bar/baz')).toBeFalsy();
      expect(DefaultMQTTPattern.matches('/foo/bar/baz', '/foo/bar')).toBeFalsy();
    });
  });

  describe('.extract', () => {
    it('extracts the params from a topic', () => {
      expect(DefaultMQTTPattern.extract('foo/bar/baz', 'foo/bar/baz')).toEqual({});
      expect(DefaultMQTTPattern.extract('foo/+/#', 'foo/bar/baz')).toEqual({});
      expect(DefaultMQTTPattern.extract('foo/#something', 'foo/bar/baz')).toEqual({
        something: ['bar', 'baz'],
      });
      expect(DefaultMQTTPattern.extract('foo/+hello/+world', 'foo/bar/baz')).toEqual({
        hello: 'bar',
        world: 'baz',
      });
      expect(DefaultMQTTPattern.extract('foo/+hello/#world', 'foo/bar/baz')).toEqual({
        hello: 'bar',
        world: ['baz'],
      });
      expect(DefaultMQTTPattern.extract('+hello/+world/#wow', 'foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
    });
  });

  describe('.exec', () => {
    it('extracts the params if the  topic matches', () => {
      expect(DefaultMQTTPattern.exec('foo/bar/baz', 'foo/bar/baz')).toEqual({});
      expect(DefaultMQTTPattern.exec('+hello/+world/#wow', 'foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(DefaultMQTTPattern.exec('hello/+world/#wow', 'foo/bar/baz/fizz')).toBeNull();
    });
  });

  describe('.fill', () => {
    it('fills the pattern with provided params', () => {
      expect(DefaultMQTTPattern.fill('+name/+property', { name: 'test' })).toBe('test/+property');
      expect(DefaultMQTTPattern.fill('+name/#property', { name: 'test' })).toBe('test/#property');
      expect(DefaultMQTTPattern.fill('+name/#property', { property: 'test' })).toBe('+name/test');
      expect(DefaultMQTTPattern.fill('+name/#property', { property: ['test0', 'test1'] })).toBe('+name/test0/test1');
    });
  });
});
