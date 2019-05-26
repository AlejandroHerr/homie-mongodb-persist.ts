import { Collection, Db } from 'mongodb';

import promisedReduce from '../../../utils/promisedReduce';

import initDeviceModel from './initDeviceModel';
import initNodeModel from './initNodeModel';
import initPropertyModel from './initPropertyModel';

const initModels = [initDeviceModel, initNodeModel, initPropertyModel];

export default (db: Db) =>
  promisedReduce<Record<string, Collection>, (db: Db) => Promise<Collection>>(
    initModels,
    (collections, model) =>
      model(db).then(collection => ({
        ...collections,
        [collection.collectionName]: collection,
      })),
    {},
  );
