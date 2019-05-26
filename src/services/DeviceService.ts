import { Collection } from 'mongodb';

import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';
import Device, { DeviceIdFields } from '../models/Device';

interface DeviceServiceConstructor {
  dbClient: MongoDbClient;
}

export default class DeviceService {
  private collection: Collection;

  public constructor({ dbClient }: DeviceServiceConstructor) {
    this.collection = dbClient.getCollection('device');
  }

  public async findOneById(idFields: DeviceIdFields) {
    const foundDevice = await this.collection.findOne(idFields);

    if (!foundDevice) {
      return null;
    }

    return new Device(foundDevice);
  }

  public async createOneById(idFields: DeviceIdFields) {
    try {
      const foundDevice = await this.findOneById(idFields);

      if (!foundDevice) {
        await this.collection.insertOne(new Device(idFields));
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  public async updateAttributeById(idFields: DeviceIdFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(idFields, update);

      if (result.n === 0) {
        throw new Error(`Device with ${JSON.stringify(idFields)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
