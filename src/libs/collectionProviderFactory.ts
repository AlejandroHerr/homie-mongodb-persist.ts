import { asValue } from 'awilix';
import { Db, Collection } from 'mongodb';

import { InitCollection } from '../infrastructure/mongoDb/collections';

import { BootableProvider } from './Container';

const getCollectionProviderName = (collactionName: string) =>
  `mongo${collactionName.charAt(0).toUpperCase() + collactionName.slice(1)}Collection`;

const make = ({ collectionName, init }: InitCollection): BootableProvider<Collection> =>
  Object.freeze({
    name: getCollectionProviderName(collectionName),
    bootableResolver: ({ mongoDbClient }: { mongoDbClient: Db }) =>
      init(mongoDbClient).then(collection => asValue(collection)),
  });

export default Object.freeze({ make });
