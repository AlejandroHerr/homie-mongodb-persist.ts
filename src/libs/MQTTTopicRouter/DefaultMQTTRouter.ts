import { Packet } from 'mqtt';
import { AsyncClient } from 'async-mqtt';

import MQTTPattern, { CreateMQTTPattern } from '../MQTTPattern';

import { TopicRouteHandler } from './types';
import MQTTTopicRouter from './MQTTTopicRouter';

export default class DefaultMQTTRouter implements MQTTTopicRouter {
  private createMQTTPattern: CreateMQTTPattern;

  private mqttClient: AsyncClient;

  private subscribed: boolean = false;

  private topicRouteHandlers: Map<string, TopicRouteHandler> = new Map();

  private topicRoutePatterns: Map<string, MQTTPattern> = new Map();

  public constructor({
    createMQTTPattern,
    mqttClient,
  }: {
    createMQTTPattern: CreateMQTTPattern;
    mqttClient: AsyncClient;
  }) {
    this.createMQTTPattern = createMQTTPattern;
    this.mqttClient = mqttClient;
  }

  private messageHandler(topic: string, payload: Buffer, packet: Packet) {
    this.topicRoutePatterns.forEach((topicRoutePattern, topicRoute) => {
      const match = topicRoutePattern.exec(topic);

      if (match) {
        const topicRouteHandler = this.topicRouteHandlers.get(topicRoute) as TopicRouteHandler;

        topicRouteHandler({
          topic,
          payload,
          packet,
          topicRoute,
          match,
        });
      }
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

    const topicPattern = this.createMQTTPattern(topic);

    this.topicRoutePatterns.set(topic, topicPattern);
    this.topicRouteHandlers.set(topic, handler);

    await this.mqttClient.subscribe(topicPattern.cleanPattern);

    return this;
  }

  public async removeTopicRoute(topic: string) {
    const topicPattern = this.topicRoutePatterns.get(topic);

    if (!topicPattern) {
      return this;
    }

    this.topicRouteHandlers.delete(topic);
    this.topicRoutePatterns.delete(topic);

    await this.mqttClient.unsubscribe(topicPattern.cleanPattern);

    return this;
  }

  public async removeAllTopicRoutes() {
    await Promise.all(
      Array.from(this.topicRoutePatterns.values()).map(topicPattern =>
        this.mqttClient.unsubscribe(topicPattern.cleanPattern),
      ),
    );

    this.topicRoutePatterns.clear();
    this.topicRouteHandlers.clear();

    return this;
  }

  public hasTopicRoute(topic: string) {
    return this.topicRouteHandlers.has(topic);
  }
}
