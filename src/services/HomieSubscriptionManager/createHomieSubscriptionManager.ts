import { DeviceUniqueFields } from '../../models/Device';
import MQTTPattern from '../../libs/MQTTPattern';
import HomieSubscriptionManager from './HomieSubscriptionManager';
import TopicPatterns from './TopicPatterns';
import { NodeUniqueFields } from '../../models/Node';
import MQTTRouter from '../../libs/MQTTRouter';

const unmatchFn = <T>(matchValue: T) => (value: T) => matchValue !== value;

const findChangesInList = <T>(prevList: T[], nextList: T[]) =>
  prevList.reduce(
    (changes, nodeId) =>
      !nextList.includes(nodeId)
        ? {
            ...changes,
            removals: changes.removals.concat(nodeId),
          }
        : {
            ...changes,
            additions: changes.additions.filter(unmatchFn(nodeId)),
          },
    {
      additions: nextList,
      removals: [] as T[],
    },
  );

const createHomieSubscriptionManager = ({
  mqttPattern,
  mqttRouter,
}: {
  mqttPattern: MQTTPattern;
  mqttRouter: MQTTRouter;
}): HomieSubscriptionManager =>
  Object.freeze({
    async addDeviceDiscoverySubscription(callback) {
      if (!mqttRouter.hasTopicRoute(TopicPatterns.DISCOVER_DEVICES)) {
        await mqttRouter.addTopicRoute(TopicPatterns.DISCOVER_DEVICES, callback);
      }

      return this;
    },

    async addDeviceSubscription(uniqueFields: DeviceUniqueFields, callback) {
      const topic = mqttPattern.fill(TopicPatterns.DEVICE_ATTRIBUTES, { deviceId: uniqueFields.id });

      if (!mqttRouter.hasTopicRoute(topic)) {
        await mqttRouter.addTopicRoute(topic, callback);
      }

      return this;
    },

    async updateNodesSubscription({ id: deviceId }: DeviceUniqueFields, nodeIds: string[], callback) {
      const nodeTopic = mqttPattern.fill(TopicPatterns.NODE_ATTRIBUTES, { deviceId });

      const prevNodeIds = mqttRouter.routedTopics
        .filter(topic => mqttPattern.matches(nodeTopic, topic))
        .map<string>(topic => mqttPattern.extract(nodeTopic, topic).nodeId as string);

      const { additions: nodesToAdd, removals: nodesToRemove } = findChangesInList(prevNodeIds, nodeIds);

      const addPromises = nodesToAdd.map(nodeId =>
        mqttRouter.addTopicRoute(mqttPattern.fill(nodeTopic, { nodeId }), callback),
      );

      const removeNodePromises = nodesToRemove.map(nodeId => {
        return mqttRouter.removeTopicRoute(mqttPattern.fill(nodeTopic, { nodeId }));
      });

      const removePromises = nodesToRemove.reduce((promises, nodeId) => {
        const propertyValueTopic = mqttPattern.fill(TopicPatterns.PROPERTY_VALUE, { deviceId, nodeId });
        const propertyAttributesTopic = mqttPattern.fill(TopicPatterns.PROPERTY_ATTRIBUTES, { deviceId, nodeId });

        return mqttRouter.routedTopics
          .filter(topic => mqttPattern.matches(propertyValueTopic, topic))
          .map<string>(topic => mqttPattern.extract(propertyValueTopic, topic).propertyId as string)
          .reduce((propertyTopicsToUnroute, propertyId) => {
            return propertyTopicsToUnroute.concat(
              mqttRouter.removeTopicRoute(mqttPattern.fill(propertyValueTopic, { propertyId })),
              mqttRouter.removeTopicRoute(mqttPattern.fill(propertyAttributesTopic, { propertyId })),
            );
          }, promises);
      }, removeNodePromises);

      await Promise.all([...addPromises, ...removePromises]);

      return this;
    },

    async updatePropertiesSubscription(
      { deviceId, id: nodeId }: NodeUniqueFields,
      propertyIds: string[],
      { attributeCallback, valueCallback },
    ) {
      const propertyValueTopic = mqttPattern.fill(TopicPatterns.PROPERTY_VALUE, { deviceId, nodeId });
      const propertyAttributesTopic = mqttPattern.fill(TopicPatterns.PROPERTY_ATTRIBUTES, { deviceId, nodeId });

      const prevPropertyIds = mqttRouter.routedTopics
        .filter(topic => mqttPattern.matches(propertyValueTopic, topic))
        .map<string>(topic => mqttPattern.extract(propertyValueTopic, topic).propertyId as string);

      const { additions: propertiesToAdd, removals: propertiesToRemove } = findChangesInList(
        prevPropertyIds,
        propertyIds,
      );

      const addPromises = propertiesToAdd.reduce<Promise<MQTTRouter>[]>(
        (promises, propertyId) =>
          promises.concat(
            mqttRouter.addTopicRoute(
              mqttPattern.fill(propertyValueTopic, { deviceId, nodeId, propertyId }),
              valueCallback,
            ),
            mqttRouter.addTopicRoute(
              mqttPattern.fill(propertyAttributesTopic, { deviceId, nodeId, propertyId }),
              attributeCallback,
            ),
          ),
        [],
      );

      const removeTopicPromises = propertiesToRemove.reduce<Promise<MQTTRouter>[]>(
        (promises, propertyId) =>
          promises.concat(
            mqttRouter.removeTopicRoute(mqttPattern.fill(propertyValueTopic, { deviceId, nodeId, propertyId })),
            mqttRouter.removeTopicRoute(mqttPattern.fill(propertyAttributesTopic, { deviceId, nodeId, propertyId })),
          ),
        [],
      );

      await Promise.all([...addPromises, ...removeTopicPromises]);

      return this;
    },
  });

export default createHomieSubscriptionManager;
