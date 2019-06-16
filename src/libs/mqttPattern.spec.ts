import originalMqttPattern from 'mqtt-pattern';

import mqttPattern from './mqttPattern';

describe('lib/mqttPatern', () => {
  describe('fill', () => {
    it('should fill only provided values', () => {
      expect(mqttPattern.fill('+name/#property', { name: 'test' })).toBe('test/#property');
      expect(originalMqttPattern.fill('+name/#property', { name: 'test' })).toBe('test');
    });
  });
  describe('exec', () => {
    it('should match the pattern', () => {
      const pattern = '+name/test/#property';
      expect(mqttPattern.exec(pattern, 'testName/testProp')).toBeNull();
      expect(mqttPattern.exec(pattern, 'testName/test/testProp')).toEqual({ name: 'testName', property: ['testProp'] });
      expect(mqttPattern.exec(pattern, 'testName/test/testProp0/testProp1')).toEqual({
        name: 'testName',
        property: ['testProp0', 'testProp1'],
      });
    });
  });
});
