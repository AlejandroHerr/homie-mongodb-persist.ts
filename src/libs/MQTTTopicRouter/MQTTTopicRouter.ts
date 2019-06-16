import { Packet } from 'mqtt';
import { AsyncClient } from 'async-mqtt';

import mqttPattern from '../mqttPattern';

import { TopicRouteHandler } from './types';

export default class MQTTTopicRouter {
  private subscribed: boolean = false;

  private mqttClient: AsyncClient;

  private topicRouteHandlers: Map<string, TopicRouteHandler> = new Map();

  public constructor({ mqttClient }: { mqttClient: AsyncClient }) {
    this.mqttClient = mqttClient;
  }

  private messageHandler(topic: string, payload: Buffer, packet: Packet) {
    this.topicRouteHandlers.forEach((topicRouteHandler, topicPattern) => {
      const match = mqttPattern.exec(topicPattern, topic);

      if (match) {
        topicRouteHandler({
          topic,
          payload,
          packet,
          topicPattern,
          match,
        });
      }
    });
  }

  public get isSubscribed() {
    return this.subscribed;
  }

  public subscribe() {
    if (this.subscribed) {
      return this;
    }

    this.subscribed = true;

    this.mqttClient.on('message', this.messageHandler.bind(this));

    return this;
  }

  public async addTopicRoute(topicPattern: string, topicRouteHandler: TopicRouteHandler) {
    this.topicRouteHandlers.set(topicPattern, topicRouteHandler);

    await this.mqttClient.subscribe(mqttPattern.clean(topicPattern));

    return this;
  }

  public async removeTopicRoute(topicPattern: string) {
    this.topicRouteHandlers.delete(topicPattern);

    await this.mqttClient.unsubscribe(mqttPattern.clean(topicPattern));

    return this;
  }

  public async removeAllTopicRoutes() {
    await Promise.all(
      Array.from(this.topicRouteHandlers).map(([topicPattern]) =>
        this.mqttClient.unsubscribe(mqttPattern.clean(topicPattern)),
      ),
    );

    this.topicRouteHandlers.clear();

    return this;
  }

  public hasTopicRoute(topic: string) {
    return this.topicRouteHandlers.has(topic);
  }
}
