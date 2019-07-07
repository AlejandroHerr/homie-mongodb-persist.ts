import { Collection } from 'mongodb';

import { NodeUniqueFields, nodeFactory } from '../../models/Node';

import NodeService from './NodeService';

interface MongoNodeServiceConstructor {
  mongoNodeCollection: Collection;
  nodeFactory: typeof nodeFactory;
}

export default class MongoNodeService implements NodeService {
  private collection: Collection;

  private modelFactory: typeof nodeFactory;

  public constructor({ mongoNodeCollection, nodeFactory: modelFactory }: MongoNodeServiceConstructor) {
    this.collection = mongoNodeCollection;
    this.modelFactory = modelFactory;
  }

  public async findOneById(uniqueFields: NodeUniqueFields) {
    const foundNode = await this.collection.findOne(uniqueFields);

    if (!foundNode) {
      return null;
    }

    return this.modelFactory(foundNode);
  }

  public async createOneById(uniqueFields: NodeUniqueFields) {
    const foundNode = await this.findOneById(uniqueFields);

    if (!foundNode) {
      await this.collection.insertOne(uniqueFields);
    }

    return this;
  }

  public async updateAttributeById(uniqueFields: NodeUniqueFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(uniqueFields, update);

      if (result.n === 0) {
        throw new Error(`Node with ${JSON.stringify(uniqueFields)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
