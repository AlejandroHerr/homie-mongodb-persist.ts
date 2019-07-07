import ConfigProvider from '../../providers/ConfigProvider';

import LoggerProvider from '../../providers/LoggerProvider';
import createAppContainerStore from '../../utils/createAppContainerStore';
import MQTTClientProvider from '../../providers/MQTTClientProvider';
import MQTTRouterProvider from '../../providers/MQTTRouterProvider';
import createHomieSubscriptionManager from './createHomieSubscriptionManager';
import MQTTPatternFactoryProvider from '../../providers/MQTTPatternProvider';
import MQTTRouter from '../../libs/MQTTRouter';

const noop = () => {};
const propCallbacks = {
  attributeCallback: noop,
  valueCallback: noop,
};

const appContainerStore = createAppContainerStore();

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();

  const homieSubscriptionManager = appContainer.build(createHomieSubscriptionManager);

  return {
    homieSubscriptionManager,
    mqttRouter: appContainer.resolve<MQTTRouter>('mqttRouter'),
  };
};

describe('services/HomieSubscriptionManager/createHomeSubscriptionManager', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(ConfigProvider, LoggerProvider, MQTTClientProvider, MQTTPatternFactoryProvider, MQTTRouterProvider)
      .boot();
  });

  afterEach(async () => {
    const mqttRouter = appContainerStore.getAppContainer().resolve<MQTTRouter>('mqttRouter');

    await mqttRouter.removeAllTopicRoutes();
  });

  afterAll(async () => {
    const appContainer = appContainerStore.getAppContainer();

    await appContainer.dispose();
  });

  describe('addDeviceDiscoverySubscription', () => {
    it('should add a subscription to discover devices', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      await homieSubscriptionManager.addDeviceDiscoverySubscription(noop);

      expect(mqttRouter.hasTopicRoute(`homie/+deviceId/$homie`)).toBeTruthy();

      await homieSubscriptionManager.addDeviceDiscoverySubscription(noop);

      expect(mqttRouter.hasTopicRoute(`homie/+deviceId/$homie`)).toBeTruthy();
    });
  });

  describe('addDeviceSubscription', () => {
    it('should add a subscription for device attributes', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId = 'myDevice';

      await homieSubscriptionManager.addDeviceSubscription({ id: deviceId }, noop);

      expect(mqttRouter.hasTopicRoute(`homie/${deviceId}/$+attribute`)).toBeTruthy();

      await homieSubscriptionManager.addDeviceSubscription({ id: deviceId }, noop);

      expect(mqttRouter.hasTopicRoute(`homie/${deviceId}/$+attribute`)).toBeTruthy();
    });
  });

  describe('updateNodesSubscription', () => {
    it('should add new nodes subscriptions', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId0 = 'myDevice0';
      const deviceId1 = 'myDevice1';

      await Promise.all([
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId0 }, noop),
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId1 }, noop),
      ]);

      await homieSubscriptionManager.updateNodesSubscription({ id: deviceId0 }, ['node0', 'node1'], noop);
      await homieSubscriptionManager.updateNodesSubscription({ id: deviceId1 }, ['node0', 'node2'], noop);

      expect(mqttRouter.routedTopics.sort()).toEqual(
        [
          `homie/${deviceId0}/$+attribute`,
          `homie/${deviceId1}/$+attribute`,
          `homie/${deviceId0}/node0/$+attribute`,
          `homie/${deviceId0}/node1/$+attribute`,
          `homie/${deviceId1}/node0/$+attribute`,
          `homie/${deviceId1}/node2/$+attribute`,
        ].sort(),
      );
    });

    it('should not add duplicates and remove unpublished nodes', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId0 = 'myDevice0';
      const deviceId1 = 'myDevice1';

      await Promise.all([
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId0 }, noop),
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId1 }, noop),
      ]);

      await Promise.all([
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId0 }, ['node0', 'node1'], noop),
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId1 }, ['node0', 'node2'], noop),
      ]);

      await Promise.all([
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId0 }, ['node0', 'node2'], noop),
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId1 }, ['node0', 'node2'], noop),
      ]);

      expect(mqttRouter.routedTopics.sort()).toEqual(
        [
          `homie/${deviceId0}/$+attribute`,
          `homie/${deviceId1}/$+attribute`,
          `homie/${deviceId0}/node0/$+attribute`,
          `homie/${deviceId0}/node2/$+attribute`,
          `homie/${deviceId1}/node0/$+attribute`,
          `homie/${deviceId1}/node2/$+attribute`,
        ].sort(),
      );
    });

    it("should remove subscriptions for removed nodes' properties", async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId = 'myDevice';
      const nodeId0 = 'myNode0';
      const nodeId1 = 'myNode1';
      const nodeId2 = 'myNode2';

      await Promise.all([
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId }, noop),
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId }, [nodeId0, nodeId1, nodeId2], noop),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId0 },
          ['prop0', 'prop01'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId1 },
          ['prop0', 'prop11'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId2 },
          ['prop0', 'prop21'],
          propCallbacks,
        ),
      ]);

      await homieSubscriptionManager.updateNodesSubscription({ id: deviceId }, [nodeId1], noop);

      expect(mqttRouter.routedTopics.sort()).toEqual(
        [
          `homie/${deviceId}/$+attribute`,
          `homie/${deviceId}/${nodeId1}/$+attribute`,
          `homie/myDevice/${nodeId1}/prop0`,
          `homie/myDevice/${nodeId1}/prop0/$+attribute`,
          `homie/myDevice/${nodeId1}/prop11`,
          `homie/myDevice/${nodeId1}/prop11/$+attribute`,
        ].sort(),
      );
    });
  });

  describe('updatePropertiesSubscription', () => {
    it('should add new properties subscribriptions', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId = 'myDevice';
      const nodeId0 = 'myNode0';
      const nodeId1 = 'myNode1';
      const nodeId2 = 'myNode2';

      await Promise.all([
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId }, noop),
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId }, [nodeId0, nodeId1, nodeId2], noop),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId0 },
          ['prop0', 'prop01'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId1 },
          ['prop0', 'prop11'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId2 },
          ['prop0', 'prop21'],
          propCallbacks,
        ),
      ]);

      expect(mqttRouter.routedTopics.sort()).toEqual(
        [
          `homie/${deviceId}/$+attribute`,
          `homie/${deviceId}/${nodeId0}/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop0/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop01/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop0`,
          `homie/${deviceId}/${nodeId0}/prop01`,
          `homie/${deviceId}/${nodeId1}/$+attribute`,
          `homie/${deviceId}/${nodeId1}/prop0/$+attribute`,
          `homie/${deviceId}/${nodeId1}/prop11/$+attribute`,
          `homie/${deviceId}/${nodeId1}/prop0`,
          `homie/${deviceId}/${nodeId1}/prop11`,
          `homie/${deviceId}/${nodeId2}/$+attribute`,
          `homie/${deviceId}/${nodeId2}/prop0/$+attribute`,
          `homie/${deviceId}/${nodeId2}/prop21/$+attribute`,
          `homie/${deviceId}/${nodeId2}/prop0`,
          `homie/${deviceId}/${nodeId2}/prop21`,
        ].sort(),
      );
    });
    it('should not add duplicates and remove unpublished properties', async () => {
      const { homieSubscriptionManager, mqttRouter } = setup();

      const deviceId = 'myDevice';
      const nodeId0 = 'myNode0';
      const nodeId1 = 'myNode1';
      const nodeId2 = 'myNode2';

      await Promise.all([
        homieSubscriptionManager.addDeviceSubscription({ id: deviceId }, noop),
        homieSubscriptionManager.updateNodesSubscription({ id: deviceId }, [nodeId0, nodeId1, nodeId2], noop),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId0 },
          ['prop0', 'prop01'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId1 },
          ['prop0', 'prop11'],
          propCallbacks,
        ),
        homieSubscriptionManager.updatePropertiesSubscription(
          { deviceId, id: nodeId2 },
          ['prop0', 'prop21'],
          propCallbacks,
        ),
      ]);

      await Promise.all([
        homieSubscriptionManager.updatePropertiesSubscription({ deviceId, id: nodeId1 }, ['prop0'], propCallbacks),
        homieSubscriptionManager.updatePropertiesSubscription({ deviceId, id: nodeId2 }, ['prop21'], propCallbacks),
      ]);

      expect(mqttRouter.routedTopics.sort()).toEqual(
        [
          `homie/${deviceId}/$+attribute`,
          `homie/${deviceId}/${nodeId0}/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop0/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop01/$+attribute`,
          `homie/${deviceId}/${nodeId0}/prop0`,
          `homie/${deviceId}/${nodeId0}/prop01`,
          `homie/${deviceId}/${nodeId1}/$+attribute`,
          `homie/${deviceId}/${nodeId1}/prop0/$+attribute`,
          `homie/${deviceId}/${nodeId1}/prop0`,
          `homie/${deviceId}/${nodeId2}/$+attribute`,
          `homie/${deviceId}/${nodeId2}/prop21/$+attribute`,
          `homie/${deviceId}/${nodeId2}/prop21`,
        ].sort(),
      );
    });
  });
});
