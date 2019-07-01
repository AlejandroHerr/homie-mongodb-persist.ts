import createHomieMQTTPattern from './createHomieMQTTPattern';
import HomieMQTTPattern from './HomieMQTTPattern';

describe('lib/MQTTPattern/HomieMQTTPattern/createHomieMQTTPattern', () => {
  it('creates a HomieMQTTPattern instance', () => {
    const mqttPattern = createHomieMQTTPattern('#topic');

    expect(mqttPattern).toBeInstanceOf(HomieMQTTPattern);
    expect(mqttPattern).toEqual(new HomieMQTTPattern('#topic'));
  });
});
