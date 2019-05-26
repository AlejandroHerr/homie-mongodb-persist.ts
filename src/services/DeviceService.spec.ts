import config from '../config';

import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';
import Device from '../models/Device';
import createDbClientStore from '../utils/createDbClientStore';

import DeviceService from './DeviceService';

const dbClientStore = createDbClientStore();

const setup = () => {
  const dbClient = dbClientStore.getDbClient();

  const deviceService = new DeviceService({ dbClient });

  return {
    dbClient,
    deviceService,
  };
};

describe('DeviceService', () => {
  beforeAll(async () => {
    const dbClient = await new MongoDbClient().connect({ config: config.mongodb });

    dbClientStore.setDbClient(dbClient);
  });

  afterAll(async () => {
    const dbClient = dbClientStore.getDbClient();

    await Promise.all([dbClient.getCollection('device').drop()]);

    await dbClient.close();
  });

  describe('findOneById', () => {
    it('should find by id and return a Device', async () => {
      const { dbClient, deviceService } = setup();

      const idFields = { id: 'findOneByIdId' };

      await dbClient.getCollection('device').insertOne(idFields);

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
      const { dbClient, deviceService } = setup();
      const idFields = { id: 'deviceId' };

      await deviceService.createOneById(idFields);

      const foundDevice = await dbClient.getCollection('device').findOne(idFields);

      expect(foundDevice).not.toBeNull();
      expect(foundDevice.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the device', async () => {
      const { dbClient, deviceService } = setup();
      const idFields = { id: 'deviceId' };

      await deviceService.createOneById(idFields);

      const foundDevices = await dbClient
        .getCollection('device')
        .find(idFields)
        .toArray();

      expect(foundDevices).toHaveLength(1);
      expect(foundDevices[0]).not.toBeNull();
      expect(foundDevices[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { dbClient, deviceService } = setup();

      const idFields = { id: 'deviceId' };

      const [attribute, value] = ['name', 'new name'];

      await deviceService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(
        dbClient
          .getCollection('device')
          .findOne(idFields)
          .then(({ attributes }) => attributes),
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
