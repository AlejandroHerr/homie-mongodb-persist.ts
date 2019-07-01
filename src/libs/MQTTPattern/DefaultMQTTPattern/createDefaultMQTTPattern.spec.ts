import createDefaultMQTTPattern from './createDefaultMQTTPattern';
import DefaultMQTTPattern from './DefaultMQTTPattern';

describe('lib/MQTTPattern/DefaultMQTTPattern/createDefaultMQTTPattern', () => {
  it('creates a DefaultMQTTPattern instance', () => {
    const mqttPattern = createDefaultMQTTPattern('#topic');

    expect(mqttPattern).toBeInstanceOf(DefaultMQTTPattern);
    expect(mqttPattern).toEqual(new DefaultMQTTPattern('#topic'));
  });
});
