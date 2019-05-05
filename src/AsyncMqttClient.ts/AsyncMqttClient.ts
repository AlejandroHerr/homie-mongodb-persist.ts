import { AsyncClient, IMqttClient } from 'async-mqtt';
import MQTTPattern from 'mqtt-pattern';

type OnTopicMessageCallback = (
  topic: string,
  message: Buffer,
  params: Record<string, string | string[]> | null,
) => void;

export default class AsyncMqttClient extends AsyncClient {
  private routedTopics: string[] = [];

  private routedTopicCallbacks: Record<string, OnTopicMessageCallback> = {};

  public constructor(client: IMqttClient) {
    super(client);

    this.once('connect', () => {
      this.on('message', this.topicRouter.bind(this));
    });
  }

  private topicRouter(topic: string, message: Buffer): void {
    this.routedTopics.forEach(routedTopic => {
      if (MQTTPattern.matches(routedTopic, topic)) {
        const callback = this.routedTopicCallbacks[routedTopic];
        callback(topic, message, MQTTPattern.extract(routedTopic, topic));
      }
    });
  }

  public subscribeToTopic(topic: string, callback: OnTopicMessageCallback) {
    this.routedTopics.push(topic);
    this.routedTopicCallbacks[topic] = callback;

    return this.subscribe(MQTTPattern.clean(topic));
  }
}
