import config from '../config';

import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';
import Node from '../models/Node';
import createDbClientStore from '../utils/createDbClientStore';

import NodeService from './NodeService';

const dbClientStore = createDbClientStore();

const setup = () => {
  const dbClient = dbClientStore.getDbClient();

  const nodeService = new NodeService({ dbClient });

  return {
    dbClient,
    nodeService,
  };
};

describe('NodeService', () => {
  beforeAll(async () => {
    const dbClient = await new MongoDbClient().connect({ config: config.mongodb });

    dbClientStore.setDbClient(dbClient);
  });

  afterAll(async () => {
    const dbClient = dbClientStore.getDbClient();

    await Promise.all([dbClient.getCollection('node').drop()]);

    await dbClient.close();
  });

  describe('findOneById', () => {
    it('should find by id and return a Node', async () => {
      const { dbClient, nodeService } = setup();

      const idFields = { deviceId: 'deviceId', id: 'id' };

      await dbClient.getCollection('node').insertOne(idFields);

      const foundNode = await nodeService.findOneById(idFields);

      expect(foundNode).toBeInstanceOf(Node);
      expect((foundNode as Node).deviceId).toBe(idFields.deviceId);
      expect((foundNode as Node).id).toBe(idFields.id);
    });

    it('should return null if none found', async () => {
      const { nodeService } = setup();

      const foundNode = await nodeService.findOneById({ deviceId: 'deviceFakeId', id: 'fakeId' });

      expect(foundNode).toBeNull();
    });
  });

  describe('.createOneById', () => {
    it('should create a new document for the node', async () => {
      const { dbClient, nodeService } = setup();
      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      await nodeService.createOneById(idFields);

      const foundNode = await dbClient.getCollection('node').findOne(idFields);

      expect(foundNode).not.toBeNull();
      expect(foundNode.deviceId).toBe(idFields.deviceId);
      expect(foundNode.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the node', async () => {
      const { dbClient, nodeService } = setup();
      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      await nodeService.createOneById(idFields);

      const foundNodes = await dbClient
        .getCollection('node')
        .find({ id: idFields.id })
        .toArray();

      expect(foundNodes).toHaveLength(1);
      expect(foundNodes[0]).not.toBeNull();
      expect(foundNodes[0].deviceId).toBe(idFields.deviceId);
      expect(foundNodes[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { dbClient, nodeService } = setup();

      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      const [attribute, value] = ['name', 'new name'];

      await nodeService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(
        dbClient
          .getCollection('node')
          .findOne(idFields)
          .then(({ attributes }) => attributes),
      ).resolves.toHaveProperty(attribute, value);
    });

    it('should throw an error if document does not exist', async () => {
      const { nodeService } = setup();

      const idFields = { deviceId: 'fakeId', id: 'fakeId' };

      const [attribute, value] = ['name', 'new name'];

      await expect(nodeService.updateAttributeById(idFields, `$${attribute}`, value)).rejects.toEqual(
        new Error(`Node with ${JSON.stringify(idFields)} not found`),
      );
    });
  });
});
