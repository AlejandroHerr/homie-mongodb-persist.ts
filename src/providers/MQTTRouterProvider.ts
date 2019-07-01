import { asClass } from 'awilix';

import { Provider } from '../libs/Container';
import MQTTRouter, { DefaultMQTTRouter } from '../libs/MQTTRouter';

const MQTTRouterProvider: Provider<MQTTRouter> = Object.freeze({
  name: 'mqttRouter',
  resolver: asClass(DefaultMQTTRouter).singleton(),
});

export default MQTTRouterProvider;
