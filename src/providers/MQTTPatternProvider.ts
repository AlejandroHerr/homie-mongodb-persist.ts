import { asValue } from 'awilix';

import { Provider } from '../libs/Container';

import MQTTPattern, { HomieMQTTPattern } from '../libs/MQTTPattern';

const MQTTPatternProvider: Provider<MQTTPattern> = Object.freeze({
  name: 'mqttPattern',
  resolver: asValue(HomieMQTTPattern),
});

export default MQTTPatternProvider;
