import { asValue } from 'awilix';

import { Provider } from '../Application';
import nodeFactory from '../models/Node/nodeFactory';

const NodeFactoryProvider: Provider<typeof nodeFactory> = Object.freeze({
  name: 'nodeFactory',
  resolver: asValue(nodeFactory),
});

export default NodeFactoryProvider;
