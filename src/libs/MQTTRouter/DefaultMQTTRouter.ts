import { Packet } from 'mqtt';
import { AsyncClient } from 'async-mqtt';

import MQTTPattern from '../MQTTPattern';

import { TopicRouteHandler } from './types';
import MQTTRouter from './MQTTRouter';

export default class DefaultMQTTRouter implements MQTTRouter {
  private mqttPattern: MQTTPattern;

  private mqttClient: AsyncClient;

  private subscribed: boolean = false;

  private topicRouteHandlers: Map<string, TopicRouteHandler> = new Map();

  public constructor({ mqttClient, mqttPattern }: { mqttClient: AsyncClient; mqttPattern: MQTTPattern }) {
    this.mqttClient = mqttClient;
    this.mqttPattern = mqttPattern;
  }

  private messageHandler(topic: string, payload: Buffer, packet: Packet) {
    this.routedTopics
      .filter(pattern => this.mqttPattern.matches(pattern, topic))
      .forEach(pattern => {
        const match = this.mqttPattern.extract(pattern, topic);
        const topicRouteHandler = this.topicRouteHandlers.get(pattern) as TopicRouteHandler;

        topicRouteHandler({
          topic,
          payload,
          packet,
          topicRoute: pattern,
          match,
        });
      });
  }

  public get routedTopics() {
    return Array.from(this.topicRouteHandlers.keys());
  }

  private subscribe() {
    this.subscribed = true;

    this.mqttClient.on('message', this.messageHandler.bind(this));

    return this;
  }

  public async addTopicRoute(topic: string, handler: TopicRouteHandler) {
    if (!this.subscribed) {
      this.subscribe();
    }

    this.topicRouteHandlers.set(topic, handler);

    await this.mqttClient.subscribe(this.mqttPattern.clean(topic));

    return this;
  }

  public async removeTopicRoute(topic: string) {
    if (!this.hasTopicRoute(topic)) {
      return this;
    }

    this.topicRouteHandlers.delete(topic);

    await this.mqttClient.unsubscribe(this.mqttPattern.clean(topic));

    return this;
  }

  public async removeAllTopicRoutes() {
    await Promise.all(
      Array.from(this.topicRouteHandlers.keys()).map(topic =>
        this.mqttClient.unsubscribe(this.mqttPattern.clean(topic)),
      ),
    );

    this.topicRouteHandlers.clear();

    return this;
  }

  public hasTopicRoute(topic: string) {
    return this.topicRouteHandlers.has(topic);
  }
}
