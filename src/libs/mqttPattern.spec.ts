import originalMqttPattern from 'mqtt-pattern';

import mqttPattern from './mqttPattern';

describe('lib/mqttPatern', () => {
  it('should fill only provided values', () => {
    expect(mqttPattern.fill('+name/#property', { name: 'test' })).toBe('test/#property');
    expect(originalMqttPattern.fill('+name/#property', { name: 'test' })).toBe('test');
  });
});
