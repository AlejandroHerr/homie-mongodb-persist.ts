import { Collection } from 'mongodb';

import Device from '../models/Device';
import ConfigProvider from '../providers/ConfigProvider';
import DeviceCollectionProvider from '../providers/DeviceCollectionProvider';
import DeviceFactoryProvider from '../providers/DeviceFactoryProvider';
import LoggerProvider from '../providers/LoggerProvider';
import MongoDbClientServiceProvider from '../providers/MongoDbClientProvider';
import createAppContainerStore from '../utils/createAppContainerStore';

import DeviceService from './DeviceService';

const appContainerStore = createAppContainerStore();

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();

  const deviceService = appContainer.build(DeviceService);

  return {
    mongoDeviceCollection: appContainer.resolve<Collection>('mongoDeviceCollection'),
    deviceService,
  };
};

describe('srvices/DeviceService', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(
        ConfigProvider,
        LoggerProvider,
        MongoDbClientServiceProvider,
        DeviceCollectionProvider,
        DeviceFactoryProvider,
      )
      .boot();
  });

  afterAll(async () => {
    const appContainer = appContainerStore.getAppContainer();
    const mongoDeviceCollection = appContainer.resolve<Collection>('mongoDeviceCollection');

    await mongoDeviceCollection.drop();

    await appContainer.dispose();
  });

  describe('findOneById', () => {
    it('should find by id and return a Device', async () => {
      const { mongoDeviceCollection, deviceService } = setup();

      const idFields = { id: 'findOneByIdId' };

      await mongoDeviceCollection.insertOne(idFields);

      const foundDevice = await deviceService.findOneById(idFields);

      expect(foundDevice).toBeInstanceOf(Device);
      expect((foundDevice as Device).id).toBe(idFields.id);
    });

    it('should return null if none found', async () => {
      const { deviceService } = setup();

      const foundDevice = await deviceService.findOneById({ id: 'fakeId' });

      expect(foundDevice).toBeNull();
    });
  });

  describe('.createOneById', () => {
    it('should create a new document for the device', async () => {
      const { mongoDeviceCollection, deviceService } = setup();
      const idFields = { id: 'deviceId' };

      await deviceService.createOneById(idFields);

      const foundDevice = await mongoDeviceCollection.findOne(idFields);

      expect(foundDevice).not.toBeNull();
      expect(foundDevice.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the device', async () => {
      const { mongoDeviceCollection, deviceService } = setup();
      const idFields = { id: 'deviceId' };

      await deviceService.createOneById(idFields);

      const foundDevices = await mongoDeviceCollection.find(idFields).toArray();

      expect(foundDevices).toHaveLength(1);
      expect(foundDevices[0]).not.toBeNull();
      expect(foundDevices[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { mongoDeviceCollection, deviceService } = setup();

      const idFields = { id: 'deviceId' };

      const [attribute, value] = ['name', 'new name'];

      await deviceService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(
        mongoDeviceCollection.findOne(idFields).then(({ attributes }) => attributes),
      ).resolves.toHaveProperty(attribute, value);
    });

    it('should throw an error if document does not exist', async () => {
      const { deviceService } = setup();

      const idFields = { id: 'fakeId' };

      const [attribute, value] = ['name', 'new name'];

      await expect(deviceService.updateAttributeById(idFields, `$${attribute}`, value)).rejects.toEqual(
        new Error(`Device with ${JSON.stringify(idFields)} not found`),
      );
    });
  });
});
