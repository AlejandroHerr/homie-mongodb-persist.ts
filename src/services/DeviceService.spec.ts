import { Collection } from 'mongodb';

import Application from '../Application';
import Device from '../models/Device';
import MongoDbClientServiceProvider from '../providers/MongoDbClientProvider';
import MongoDbCollectionsProvider from '../providers/MongoDbCollectionsProvider';
import ConfigProvider from '../providers/ConfigProvider';
import LoggerProvider from '../providers/LoggerProvier';
import createApplicationStore from '../utils/createApplicationStore';

import DeviceService from './DeviceService';

const applicationStore = createApplicationStore();

const setup = () => {
  const application = applicationStore.getApplication();

  const deviceService = new DeviceService(application.container.cradle);

  return {
    mongoDeviceCollection: application.resolve<Collection>('mongoDeviceCollection'),
    deviceService,
  };
};

describe('DeviceService', () => {
  beforeAll(async () => {
    const application = await Application.createApplication()
      .register(ConfigProvider, LoggerProvider, MongoDbClientServiceProvider, MongoDbCollectionsProvider)
      .boot();

    applicationStore.setApplication(application);
  });

  afterAll(async () => {
    const application = applicationStore.getApplication();
    const mongoDeviceCollection = application.resolve<Collection>('mongoDeviceCollection');

    await mongoDeviceCollection.drop();

    await application.dispose();
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
