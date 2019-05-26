import config from '../config';

import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';
import Property from '../models/Property';
import createDbClientStore from '../utils/createDbClientStore';

import PropertyService from './PropertyService';

const dbClientStore = createDbClientStore();

const setup = () => {
  const dbClient = dbClientStore.getDbClient();

  const propertyService = new PropertyService({ dbClient });

  return {
    dbClient,
    propertyService,
  };
};

describe('PropertyService', () => {
  beforeAll(async () => {
    const dbClient = await new MongoDbClient().connect({ config: config.mongodb });

    dbClientStore.setDbClient(dbClient);
  });

  afterAll(async () => {
    const dbClient = dbClientStore.getDbClient();

    await Promise.all([dbClient.getCollection('property').drop()]);

    await dbClient.close();
  });

  describe('findOneById', () => {
    it('should find by id and return a Property', async () => {
      const { dbClient, propertyService } = setup();

      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'id' };

      await dbClient.getCollection('property').insertOne(idFields);

      const foundProperty = await propertyService.findOneById(idFields);

      expect(foundProperty).toBeInstanceOf(Property);
      expect((foundProperty as Property).deviceId).toBe(idFields.deviceId);
      expect((foundProperty as Property).id).toBe(idFields.id);
    });

    it('should return null if none found', async () => {
      const { propertyService } = setup();

      const foundProperty = await propertyService.findOneById({
        deviceId: 'deviceFakeId',
        nodeId: 'nodeFakeId',
        id: 'fakeId',
      });

      expect(foundProperty).toBeNull();
    });
  });

  describe('.createOneById', () => {
    it('should create a new document for the property', async () => {
      const { dbClient, propertyService } = setup();
      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      await propertyService.createOneById(idFields);

      const foundProperty = await dbClient.getCollection('property').findOne(idFields);

      expect(foundProperty).not.toBeNull();
      expect(foundProperty.deviceId).toBe(idFields.deviceId);
      expect(foundProperty.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the property', async () => {
      const { dbClient, propertyService } = setup();
      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      await propertyService.createOneById(idFields);

      const foundProperties = await dbClient
        .getCollection('property')
        .find({ id: idFields.id })
        .toArray();

      expect(foundProperties).toHaveLength(1);
      expect(foundProperties[0]).not.toBeNull();
      expect(foundProperties[0].deviceId).toBe(idFields.deviceId);
      expect(foundProperties[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { dbClient, propertyService } = setup();

      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      const [attribute, value] = ['name', 'new name'];

      await propertyService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(
        dbClient
          .getCollection('property')
          .findOne(idFields)
          .then(({ attributes }) => attributes),
      ).resolves.toHaveProperty(attribute, value);
    });

    it('should throw an error if document does not exist', async () => {
      const { propertyService } = setup();

      const idFields = { deviceId: 'fakeId', nodeId: 'fakeId', id: 'fakeId' };

      const [attribute, value] = ['name', 'new name'];

      await expect(propertyService.updateAttributeById(idFields, `$${attribute}`, value)).rejects.toEqual(
        new Error(`Property with ${JSON.stringify(idFields)} not found`),
      );
    });
  });
});
