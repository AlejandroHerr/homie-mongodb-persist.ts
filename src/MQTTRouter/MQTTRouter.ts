import { AsyncClient } from 'async-mqtt';

import mqttPattern from '../libs/mqttPattern';

import { OnTopicMessageCallback } from './types';

interface MQTTRouterConstructor {
  mqttClient: AsyncClient;
}

export default class MQTTRouter {
  private mqttClient: AsyncClient;

  private isSubscribed: boolean = false;

  private routedTopics: string[] = [];

  private routedTopicCallbacks: Record<string, OnTopicMessageCallback> = {};

  public constructor({ mqttClient }: MQTTRouterConstructor) {
    this.mqttClient = mqttClient;
  }

  public async subscribe() {
    if (this.isSubscribed) {
      return this;
    }

    this.isSubscribed = true;

    await this.mqttClient.on('message', this.topicRouter.bind(this));

    return this;
  }

  private topicRouter(topic: string, message: Buffer): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const routedTopic of this.routedTopics) {
      const params = mqttPattern.exec(routedTopic, topic);

      if (params) {
        const callback = this.routedTopicCallbacks[routedTopic];

        callback(topic, message, params || {});

        break;
      }
    }
  }

  public async routeTopic(topic: string, callback: OnTopicMessageCallback) {
    this.routedTopics.push(topic);
    this.routedTopicCallbacks[topic] = callback;

    if (!this.isSubscribed) {
      await this.subscribe();
    }

    await this.mqttClient.subscribe(mqttPattern.clean(topic));

    return this;
  }
}
