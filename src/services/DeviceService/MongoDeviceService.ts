import { Collection } from 'mongodb';

import { DeviceUniqueFields, deviceFactory } from '../../models/Device';

import DeviceService from './DeviceService';

interface MongoDeviceServiceConstructor {
  deviceFactory: typeof deviceFactory;
  mongoDeviceCollection: Collection;
}

export default class MongoDeviceService implements DeviceService {
  private collection: Collection;

  private modelFactory: typeof deviceFactory;

  public constructor({ deviceFactory: modelFactory, mongoDeviceCollection }: MongoDeviceServiceConstructor) {
    this.collection = mongoDeviceCollection;
    this.modelFactory = modelFactory;
  }

  public async findOneById(modelFactory: DeviceUniqueFields) {
    const foundDevice = await this.collection.findOne(modelFactory);

    if (!foundDevice) {
      return null;
    }

    return this.modelFactory(foundDevice);
  }

  public async createOneById(modelFactory: DeviceUniqueFields) {
    const foundDevice = await this.findOneById(modelFactory);

    if (!foundDevice) {
      await this.collection.insertOne(modelFactory);
    }

    return this;
  }

  public async updateAttributeById(modelFactory: DeviceUniqueFields, attribute: string, value: string | number) {
    try {
      const key = attribute.replace('$', '');
      const update = { $set: { [`attributes.${key}`]: value } };

      const { result } = await this.collection.updateOne(modelFactory, update);

      if (result.n === 0) {
        throw new Error(`Device with ${JSON.stringify(modelFactory)} not found`);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }
}
