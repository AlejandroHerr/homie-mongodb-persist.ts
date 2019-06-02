import { Db } from 'mongodb';

const COLLECTION_NAME = 'device';

export default async (db: Db) => {
  const collection = db.collection(COLLECTION_NAME);

  await collection.createIndex({ id: 1 }, { unique: true });

  return collection;
};
