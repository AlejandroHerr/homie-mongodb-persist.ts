import { asValue } from 'awilix';
import { Db, Collection } from 'mongodb';

import { AsyncProvider, Provider } from '../../Application';

import initDeviceCollection from './collections/initDeviceCollection';
import initNodeCollection from './collections/initNodeCollection';
import initPropertyCollection from './collections/initPropertyCollection';

const gerCollectionProviderName = (collactionName: string) =>
  `mongo${collactionName.charAt(0).toUpperCase() + collactionName.slice(1)}Collection`;

const createCollectionProvider = (collection: Collection): Provider<Collection> =>
  Object.freeze({
    name: gerCollectionProviderName(collection.collectionName),
    resolver: asValue(collection),
  });

const MongoDbCollectionsProvider: AsyncProvider<Collection> = Object.freeze({
  name: 'mongoDbCollections',
  async asyncResolver({ mongoDbClient }: { mongoDbClient: Db }) {
    const collections = await Promise.all(
      [initDeviceCollection, initNodeCollection, initPropertyCollection].map(initCollection =>
        initCollection(mongoDbClient),
      ),
    );

    return collections.map(createCollectionProvider);
  },
});

export default MongoDbCollectionsProvider;
