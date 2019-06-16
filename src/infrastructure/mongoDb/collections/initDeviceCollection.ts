import { Db } from 'mongodb';

const collectionName = 'device';

export default Object.freeze({
  collectionName,
  async init(db: Db) {
    const collection = db.collection(collectionName);

    await collection.createIndex({ id: 1 }, { unique: true });

    return collection;
  },
});
