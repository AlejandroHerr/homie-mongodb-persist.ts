import HomieMQTTPattern from './HomieMQTTPattern';

describe('lib/MQTTPattern/HomieMQTTPattern/helpers', () => {
  it('has a cleanPattern property', () => {
    expect(HomieMQTTPattern.clean('hello/+param1/world/#param2')).toBe('hello/+/world/#');
    expect(HomieMQTTPattern.clean('hello/$+param1/world/#param2')).toBe('hello/+/world/#');
    expect(HomieMQTTPattern.clean('hello/+/world/#')).toBe('hello/+/world/#');
    expect(HomieMQTTPattern.clean('hello/$+param1/world/$#param2')).toBe('hello/+/world/$#param2');
  });

  describe('.matches', () => {
    it('checks if topic matches the pattern', () => {
      expect(HomieMQTTPattern.matches('foo/bar/baz', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/bar/baz', 'baz/bar/foo')).toBeFalsy();
      expect(HomieMQTTPattern.matches('#', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/#', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/bar/#', 'foo/bar')).toBeTruthy();
      expect(HomieMQTTPattern.matches('#/bar/baz', 'foo/bar/baz')).toBeFalsy();
      expect(HomieMQTTPattern.matches('+/bar/baz', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/bar/+', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/+/baz', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/+/#', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('foo/+something/#else', 'foo/bar/baz')).toBeTruthy();
      expect(HomieMQTTPattern.matches('/foo/bar', '/foo/bar')).toBeTruthy();
      expect(HomieMQTTPattern.matches('/foo/bar', '/bar/foo')).toBeFalsy();
      expect(HomieMQTTPattern.matches('+name/$+property', 'myName/$prop1')).toBeTruthy();
      expect(HomieMQTTPattern.matches('+name/$+property', 'myName/prop1')).toBeFalsy();
      expect(HomieMQTTPattern.matches('/foo/bar', '/foo/bar/baz')).toBeFalsy();
      expect(HomieMQTTPattern.matches('/foo/bar/baz', '/foo/bar')).toBeFalsy();
      expect(
        HomieMQTTPattern.matches('homie/myDevice0/myNode0/+propertyId', 'homie/myDevice0/myNode0/$+attribute'),
      ).toBeFalsy();
      expect(
        HomieMQTTPattern.matches('homie/myDevice0/+nodeId/$+attribute', 'homie/myDevice0/$+attribute'),
      ).toBeFalsy();
      expect(
        HomieMQTTPattern.matches('homie/myDevice0/myNode/myProperty', 'homie/myDevice0/myNode/$homie'),
      ).toBeFalsy();
    });
  });

  describe('.extract', () => {
    it('extracts the params from a topic', () => {
      expect(HomieMQTTPattern.extract('foo/bar/baz', 'foo/bar/baz')).toEqual({});
      expect(HomieMQTTPattern.extract('foo/+/#', 'foo/bar/baz')).toEqual({});
      expect(HomieMQTTPattern.extract('foo/#something', 'foo/bar/baz')).toEqual({
        something: ['bar', 'baz'],
      });
      expect(HomieMQTTPattern.extract('foo/+hello/+world', 'foo/bar/baz')).toEqual({
        hello: 'bar',
        world: 'baz',
      });
      expect(HomieMQTTPattern.extract('foo/+hello/#world', 'foo/bar/baz')).toEqual({
        hello: 'bar',
        world: ['baz'],
      });
      expect(HomieMQTTPattern.extract('+hello/+world/#wow', 'foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(HomieMQTTPattern.extract('+hello/$+world/#wow', 'foo/$bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(HomieMQTTPattern.extract('+hello/$+world/#wow', 'foo/bar/baz/fizz')).toEqual({
        hello: 'foo',
        wow: ['baz', 'fizz'],
      });
    });
  });

  describe('.exec', () => {
    it('extracts the params if the  topic matches', () => {
      expect(HomieMQTTPattern.exec('foo/bar/baz', 'foo/bar/baz')).toEqual({});
      expect(HomieMQTTPattern.exec('+hello/$+world/#wow', 'foo/$bar/baz/fizz')).toEqual({
        hello: 'foo',
        world: 'bar',
        wow: ['baz', 'fizz'],
      });
      expect(HomieMQTTPattern.exec('+hello/$+world/#wow', 'foo/bar/baz/fizz')).toBeNull();
      expect(
        HomieMQTTPattern.exec('homie/myDevice0/myNode0/+propertyId', 'homie/myDevice0/myNode0/$+attribute'),
      ).toBeNull();
    });
  });

  describe('.fill', () => {
    it('fills the pattern with provided params', () => {
      expect(HomieMQTTPattern.fill('+name/+property', { name: 'test' })).toBe('test/+property');
      expect(HomieMQTTPattern.fill('+name/#property', { name: 'test' })).toBe('test/#property');
      expect(HomieMQTTPattern.fill('+name/#property', { property: 'test' })).toBe('+name/test');
      expect(HomieMQTTPattern.fill('+name/#property', { property: ['test0', 'test1'] })).toBe('+name/test0/test1');
      expect(HomieMQTTPattern.fill('+name/$+property', { name: 'test', property: 'testProp' })).toBe('test/$testProp');
      expect(HomieMQTTPattern.fill('+name/$+property', { name: 'test' })).toBe('test/$+property');
      expect(HomieMQTTPattern.fill('+name/$#property', { name: 'test', property: ['testProp0', 'testProp1'] })).toBe(
        'test/$#property',
      );
    });
  });
});
