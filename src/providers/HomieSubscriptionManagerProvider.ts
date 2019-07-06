import { asFunction } from 'awilix';

import { Provider } from '../libs/Container';
import HomieSubscriptionManager, { createHomieSubscriptionManager } from '../services/HomieSubscriptionManager';

const HomieSubscriptionManagerProvider: Provider<HomieSubscriptionManager> = Object.freeze({
  name: 'nodeFactory',
  resolver: asFunction(createHomieSubscriptionManager).singleton(),
});

export default HomieSubscriptionManagerProvider;
