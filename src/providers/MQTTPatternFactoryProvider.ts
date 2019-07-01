import { asValue } from 'awilix';

import { Provider } from '../libs/Container';

import { CreateMQTTPattern, createHomieMQTTPattern } from '../libs/MQTTPattern';

const createMQTTPattern: Provider<CreateMQTTPattern> = Object.freeze({
  name: 'createMQTTPattern',
  resolver: asValue(createHomieMQTTPattern),
});

export default createMQTTPattern;
