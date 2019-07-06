import { AsyncClient } from 'async-mqtt';

import { asValue } from 'awilix';
import ConfigProvider from '../../providers/ConfigProvider';
import LoggerProvider from '../../providers/LoggerProvider';
import MQTTClientProvider from '../../providers/MQTTClientProvider';
import createAppContainerStore from '../../utils/createAppContainerStore';
import publishAndWaitForMessage from '../../utils/publishAndWaitForMessage';

import { DefaultMQTTPattern } from '../MQTTPattern';

import DefaultMQTTRouter from './DefaultMQTTRouter';

const appContainerStore = createAppContainerStore();

const BASE_TOPIC = '/libs/DefaultMQTTRouter';

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();
  const mqttRouter = appContainer.build(DefaultMQTTRouter);

  return {
    mqttRouter,
    mqttClient: appContainer.resolve<AsyncClient>('mqttClient'),
  };
};

describe('libs/MQTTRouter/DefaultMQTTRouter', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(ConfigProvider, LoggerProvider, MQTTClientProvider, {
        name: 'mqttPattern',
        resolver: asValue(DefaultMQTTPattern),
      })
      .boot();
  });

  afterAll(async () => {
    await appContainerStore.getAppContainer().dispose();
  });

  describe('.addTopicRoute', () => {
    it(' should route topics', async () => {
      const { mqttRouter, mqttClient } = setup();

      const topicRoute0 = {
        topic: `${BASE_TOPIC}/addTopicRoute/0/+name/#args`,
        handler: jest.fn(),
      };
      const topicRoute1 = {
        topic: `${BASE_TOPIC}/addTopicRoute/1/+name/#args`,
        handler: jest.fn(),
      };

      await Promise.all([
        mqttRouter.addTopicRoute(topicRoute0.topic, topicRoute0.handler),
        mqttRouter.addTopicRoute(topicRoute1.topic, topicRoute1.handler),
      ]);

      await publishAndWaitForMessage(mqttClient, `${BASE_TOPIC}/addTopicRoute/0/testName/arg0/arg1`, 'testValue');

      expect(topicRoute0.handler).toHaveBeenCalledTimes(1);

      const [[args]] = topicRoute0.handler.mock.calls;

      expect(args.payload.toString()).toBe('testValue');
      expect(args.topicRoute).toBe(topicRoute0.topic);
      expect(args.match).toEqual({
        name: 'testName',
        args: ['arg0', 'arg1'],
      });

      expect(topicRoute1.handler).not.toHaveBeenCalled();
    });
  });

  describe('.removeTopicRoute', () => {
    it('should remove the listener for the route', async () => {
      const { mqttRouter, mqttClient } = setup();

      const topicRoute = {
        topic: `${BASE_TOPIC}/removeTopicRoute`,
        handler: jest.fn(),
      };

      await mqttRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);
      await mqttRouter.removeTopicRoute(topicRoute.topic);

      await publishAndWaitForMessage(mqttClient, topicRoute.topic, 'testValue');

      expect(topicRoute.handler).not.toHaveBeenCalled();
    });

    it('should do nothing if topic is not routed the listener for the route', async () => {
      const { mqttRouter } = setup();

      const topicRoute = {
        topic: `${BASE_TOPIC}/removeTopicRoute`,
        handler: jest.fn(),
      };

      await expect(mqttRouter.removeTopicRoute(topicRoute.topic)).resolves.toBe(mqttRouter);
    });
  });

  describe('.removeAllTopicRoutes', () => {
    it(' should remeove the listener for the route', async () => {
      const { mqttRouter, mqttClient } = setup();

      const topicRoutes = [
        {
          topic: `${BASE_TOPIC}/removeAllTopicRoutes/0`,
          handler: jest.fn(),
        },
        {
          topic: `${BASE_TOPIC}/removeAllTopicRoutes/1`,
          handler: jest.fn(),
        },
      ];

      await Promise.all([
        mqttRouter.addTopicRoute(topicRoutes[0].topic, topicRoutes[0].handler),
        mqttRouter.addTopicRoute(topicRoutes[1].topic, topicRoutes[1].handler),
      ]);

      await mqttRouter.removeAllTopicRoutes();

      await publishAndWaitForMessage(mqttClient, topicRoutes[0].topic, 'testValue');
      await publishAndWaitForMessage(mqttClient, topicRoutes[1].topic, 'testValue');

      expect(topicRoutes[0].handler).not.toHaveBeenCalled();
      expect(topicRoutes[1].handler).not.toHaveBeenCalled();
    });
  });

  describe('.hasTopicRoute', () => {
    it('should return true if topic is routed', async () => {
      const { mqttRouter } = setup();

      const topicRoute = {
        topic: `${BASE_TOPIC}/subscribe`,
        handler: () => {},
      };

      expect(mqttRouter.hasTopicRoute(topicRoute.topic)).toBeFalsy();

      await mqttRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);

      expect(mqttRouter.hasTopicRoute(topicRoute.topic)).toBeTruthy();
    });
  });

  describe('.routedTopics', () => {
    it('should be a list  of all the routed topics', async () => {
      const { mqttRouter } = setup();

      await Promise.all([
        mqttRouter.addTopicRoute(`${BASE_TOPIC}/routedTopics0`, () => {}),
        mqttRouter.addTopicRoute(`${BASE_TOPIC}/routedTopics1`, () => {}),
        mqttRouter.addTopicRoute(`${BASE_TOPIC}/routedTopics2`, () => {}),
      ]);

      expect(mqttRouter.routedTopics).toEqual([
        `${BASE_TOPIC}/routedTopics0`,
        `${BASE_TOPIC}/routedTopics1`,
        `${BASE_TOPIC}/routedTopics2`,
      ]);
    });
  });
});
