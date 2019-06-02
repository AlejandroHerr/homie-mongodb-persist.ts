import { Db } from 'mongodb';

const COLLECTION_NAME = 'property';

export default async (db: Db) => {
  const collection = db.collection(COLLECTION_NAME);

  await collection.createIndex({ deviceId: 1, nodeId: 1, id: 1 }, { unique: true });

  return collection;
};
