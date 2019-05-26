import { Collection, Db, MongoClient } from 'mongodb';

import initCollections from './initCollections';

export interface MongoDbConfig {
  host: string;
  port: number;
  dbName: string;
}

export default class MongoDbClient {
  public client!: MongoClient;

  public db!: Db;

  private collections: Record<string, Collection> = {};

  public async connect({ config }: { config: MongoDbConfig }) {
    this.client = new MongoClient(`mongodb://${config.host}:${config.port}`, {
      useNewUrlParser: true,
    });

    await this.client.connect();

    this.db = this.client.db(config.dbName);

    this.collections = await initCollections(this.db);

    return this;
  }

  public get databaseName() {
    return this.db.databaseName;
  }

  public getCollection(collectionName: string) {
    const collection = this.collections[collectionName];

    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    return collection;
  }

  public async close() {
    await this.client.close();

    return this;
  }
}
