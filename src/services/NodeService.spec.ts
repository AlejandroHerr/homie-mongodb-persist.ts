import { Collection } from 'mongodb';

import Application from '../Application';
import Node from '../models/Node';
import ConfigProvider from '../providers/ConfigProvider';
import LoggerProvider from '../providers/LoggerProvider';
import MongoDbClientServiceProvider from '../providers/MongoDbClientProvider';
import MongoDbCollectionsProvider from '../providers/MongoDbCollectionsProvider';
import createApplicationStore from '../utils/createApplicationStore';

import NodeService from './NodeService';

const applicationStore = createApplicationStore();

const setup = () => {
  const application = applicationStore.getApplication();

  const nodeService = new NodeService(application.container.cradle);

  return {
    mongoNodeCollection: application.resolve<Collection>('mongoNodeCollection'),
    nodeService,
  };
};

describe('NodeService', () => {
  beforeAll(async () => {
    const application = await Application.createApplication()
      .register(ConfigProvider, LoggerProvider, MongoDbClientServiceProvider, MongoDbCollectionsProvider)
      .boot();

    applicationStore.setApplication(application);
  });

  afterAll(async () => {
    const application = applicationStore.getApplication();
    const mongoNodeCollection = application.resolve<Collection>('mongoNodeCollection');

    await mongoNodeCollection.drop();

    await application.dispose();
  });

  describe('findOneById', () => {
    it('should find by id and return a Node', async () => {
      const { mongoNodeCollection, nodeService } = setup();

      const idFields = { deviceId: 'deviceId', id: 'id' };

      await mongoNodeCollection.insertOne(idFields);

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
      const { mongoNodeCollection, nodeService } = setup();
      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      await nodeService.createOneById(idFields);

      const foundNode = await mongoNodeCollection.findOne(idFields);

      expect(foundNode).not.toBeNull();
      expect(foundNode.deviceId).toBe(idFields.deviceId);
      expect(foundNode.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the node', async () => {
      const { mongoNodeCollection, nodeService } = setup();
      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      await nodeService.createOneById(idFields);

      const foundNodes = await mongoNodeCollection.find({ id: idFields.id }).toArray();

      expect(foundNodes).toHaveLength(1);
      expect(foundNodes[0]).not.toBeNull();
      expect(foundNodes[0].deviceId).toBe(idFields.deviceId);
      expect(foundNodes[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { mongoNodeCollection, nodeService } = setup();

      const idFields = { deviceId: 'deviceId', id: 'nodeId' };

      const [attribute, value] = ['name', 'new name'];

      await nodeService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(mongoNodeCollection.findOne(idFields).then(({ attributes }) => attributes)).resolves.toHaveProperty(
        attribute,
        value,
      );
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
