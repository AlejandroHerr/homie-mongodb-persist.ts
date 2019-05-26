import { Collection } from 'mongodb';

import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';
import Node, { NodeIdFields } from '../models/Node';

interface NodeServiceConstructor {
  dbClient: MongoDbClient;
}

export default class NodeService {
  private collection: Collection;

  public constructor({ dbClient }: NodeServiceConstructor) {
    this.collection = dbClient.getCollection('node');
  }

  public async findOneById(idFields: NodeIdFields) {
    const foundNode = await this.collection.findOne(idFields);

    if (!foundNode) {
      return null;
    }

    return new Node(foundNode);
  }

  public async createOneById(idFields: NodeIdFields) {
    try {
      const foundNode = await this.findOneById(idFields);

      if (!foundNode) {
        await this.collection.insertOne(new Node(idFields));
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  public async updateAttributeById(idFields: NodeIdFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(idFields, update);

      if (result.n === 0) {
        throw new Error(`Node with ${JSON.stringify(idFields)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
