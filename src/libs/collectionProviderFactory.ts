import { asValue } from 'awilix';
import { Db, Collection } from 'mongodb';

import { AsyncProvider } from '../Application';
import { InitCollection } from '../infrastructure/mongoDb/collections';

const getCollectionProviderName = (collactionName: string) =>
  `mongo${collactionName.charAt(0).toUpperCase() + collactionName.slice(1)}Collection`;

const make = ({ collectionName, init }: InitCollection): AsyncProvider<Collection> =>
  Object.freeze({
    name: getCollectionProviderName(collectionName),
    async asyncResolver({ mongoDbClient }: { mongoDbClient: Db }) {
      return init(mongoDbClient).then(collection => asValue(collection));
    },
  });

export default Object.freeze({ make });
