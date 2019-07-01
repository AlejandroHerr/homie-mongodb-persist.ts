import { asClass } from 'awilix';

import { Provider } from '../libs/Container';
import MQTTTopicRouter, { DefaultMQTTRouter } from '../libs/MQTTTopicRouter';

const MQTTTopicRouterProvider: Provider<MQTTTopicRouter> = Object.freeze({
  name: 'mqttTopicRouter',
  resolver: asClass(DefaultMQTTRouter).singleton(),
});

export default MQTTTopicRouterProvider;
