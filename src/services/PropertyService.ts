import { Collection } from 'mongodb';

import Property, { PropertyIdFields } from '../models/Property';

interface PropertyServiceConstructor {
  mongoPropertyCollection: Collection;
}

export default class PropertyService {
  private collection: Collection;

  public constructor({ mongoPropertyCollection }: PropertyServiceConstructor) {
    this.collection = mongoPropertyCollection;
  }

  public async findOneById(idFields: PropertyIdFields) {
    const foundProperty = await this.collection.findOne(idFields);

    if (!foundProperty) {
      return null;
    }

    return new Property(foundProperty);
  }

  public async createOneById(idFields: PropertyIdFields) {
    try {
      const foundProperty = await this.findOneById(idFields);

      if (!foundProperty) {
        await this.collection.insertOne(new Property(idFields));
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  public async updateAttributeById(idFields: PropertyIdFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(idFields, update);

      if (result.n === 0) {
        throw new Error(`Property with ${JSON.stringify(idFields)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
