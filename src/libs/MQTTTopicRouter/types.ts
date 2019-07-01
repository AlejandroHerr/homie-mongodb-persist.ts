import { Packet } from 'mqtt';

import { MQTTPatternParams } from '../MQTTPattern';

export interface TopicRoutePayload {
  topic: string;
  payload: Buffer;
  packet: Packet;
  topicRoute: string;
  match: MQTTPatternParams;
}

export type TopicRouteHandler = (payload: TopicRoutePayload) => void;
