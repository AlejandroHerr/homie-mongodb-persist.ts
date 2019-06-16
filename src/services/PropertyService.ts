import { Collection } from 'mongodb';

import { PropertyUniqueFields, propertyFactory } from '../models/Property';

interface PropertyServiceConstructor {
  mongoPropertyCollection: Collection;
  propertyFactory: typeof propertyFactory;
}

export default class PropertyService {
  private collection: Collection;

  private modelFactory: typeof propertyFactory;

  public constructor({ mongoPropertyCollection, propertyFactory: modelFactory }: PropertyServiceConstructor) {
    this.collection = mongoPropertyCollection;
    this.modelFactory = modelFactory;
  }

  public async findOneById(uniqueFields: PropertyUniqueFields) {
    const foundProperty = await this.collection.findOne(uniqueFields);

    if (!foundProperty) {
      return null;
    }

    return this.modelFactory(foundProperty);
  }

  public async createOneById(uniqueFields: PropertyUniqueFields) {
    const foundProperty = await this.findOneById(uniqueFields);

    if (!foundProperty) {
      await this.collection.insertOne(uniqueFields);
    }

    return this;
  }

  public async updateAttributeById(uniqueFields: PropertyUniqueFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(uniqueFields, update);

      if (result.n === 0) {
        throw new Error(`Property with ${JSON.stringify(uniqueFields)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
