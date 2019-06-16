import { Packet } from 'mqtt';

export type Match = Record<string, string | string[]>;

export interface TopicRoutePayload {
  topic: string;
  payload: Buffer;
  packet: Packet;
  topicPattern: string;
  match: Match;
}

export type TopicRouteHandler = (payload: TopicRoutePayload) => void;
