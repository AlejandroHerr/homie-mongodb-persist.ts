import { asClass } from 'awilix';

import { Provider } from '../Application';
import MQTTTopicRouter from '../libs/MQTTTopicRouter/MQTTTopicRouter';

const MQTTTopicRouterProvider: Provider<MQTTTopicRouter> = Object.freeze({
  name: 'mqttTopicRouter',
  resolver: asClass(MQTTTopicRouter),
});

export default MQTTTopicRouterProvider;
