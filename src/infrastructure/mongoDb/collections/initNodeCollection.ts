import { Db } from 'mongodb';

const COLLECTION_NAME = 'node';

export default async (db: Db) => {
  const collection = await db.collection(COLLECTION_NAME);

  await collection.createIndex({ deviceId: 1, id: 1 }, { unique: true });

  return collection;
};
