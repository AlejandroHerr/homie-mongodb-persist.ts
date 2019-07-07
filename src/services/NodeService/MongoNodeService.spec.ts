import { Collection } from 'mongodb';

import Node from '../../models/Node';
import ConfigProvider from '../../providers/ConfigProvider';
import LoggerProvider from '../../providers/LoggerProvider';
import MongoDbClientServiceProvider from '../../providers/MongoDbClientProvider';
import NodeCollectionProvider from '../../providers/NodeCollectionProvider';
import NodeFactoryProvider from '../../providers/NodeFactoryProvider';
import createAppContainerStore from '../../utils/createAppContainerStore';

import MongoNodeService from './MongoNodeService';

const appContainerStore = createAppContainerStore();

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();

  const nodeService = appContainer.build(MongoNodeService);

  return {
    mongoNodeCollection: appContainer.resolve<Collection>('mongoNodeCollection'),
    nodeService,
  };
};

describe('services/NodeService/MongoNodeService', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(
        ConfigProvider,
        LoggerProvider,
        MongoDbClientServiceProvider,
        NodeCollectionProvider,
        NodeFactoryProvider,
      )
      .boot();
  });

  afterAll(async () => {
    const appContainer = appContainerStore.getAppContainer();
    const mongoNodeCollection = appContainer.resolve<Collection>('mongoNodeCollection');

    await mongoNodeCollection.drop();

    await appContainer.dispose();
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
