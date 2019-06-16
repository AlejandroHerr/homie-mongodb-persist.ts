import { Db } from 'mongodb';

const collectionName = 'node';

export default Object.freeze({
  collectionName,
  async init(db: Db) {
    const collection = await db.collection(collectionName);

    await collection.createIndex({ deviceId: 1, id: 1 }, { unique: true });

    return collection;
  },
});
