import { Db } from 'mongodb';

const collectionName = 'property';

export default Object.freeze({
  collectionName,
  async init(db: Db) {
    const collection = db.collection(collectionName);

    await collection.createIndex({ deviceId: 1, nodeId: 1, id: 1 }, { unique: true });

    return collection;
  },
});
