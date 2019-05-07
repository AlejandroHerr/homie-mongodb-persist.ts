import MQTTPattern from 'mqtt-pattern';
import { AsyncClient } from 'async-mqtt';

export type OnTopicMessageCallback = (
  topic: string,
  message: Buffer,
  params: Record<string, string | string[]> | null,
) => void;

export default class MqttRouter {
  private client!: AsyncClient;

  private isSubscribed: boolean = false;

  private routedTopics: string[] = [];

  private routedTopicCallbacks: Record<string, OnTopicMessageCallback> = {};

  public constructor(client: AsyncClient) {
    this.client = client;
  }

  public async subscribe() {
    if (this.isSubscribed) {
      return this;
    }

    this.isSubscribed = true;

    await this.client.on('message', this.topicRouter.bind(this));

    return this;
  }

  private topicRouter(topic: string, message: Buffer): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const routedTopic of this.routedTopics) {
      const params = MQTTPattern.exec(routedTopic, topic);

      if (params) {
        const callback = this.routedTopicCallbacks[routedTopic];

        callback(topic, message, params);

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

    await this.client.subscribe(MQTTPattern.clean(topic));

    return this;
  }
}
