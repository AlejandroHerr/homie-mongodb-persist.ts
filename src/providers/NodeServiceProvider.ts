import { asClass } from 'awilix';

import { Provider } from '../libs/Container';

import NodeService, { MongoNodeService } from '../services/NodeService';

const NodeServiceProvider: Provider<NodeService> = Object.freeze({
  name: 'nodeService',
  resolver: asClass(MongoNodeService).singleton(),
});

export default NodeServiceProvider;
