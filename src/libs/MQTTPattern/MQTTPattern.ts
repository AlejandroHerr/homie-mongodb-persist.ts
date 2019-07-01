export type MQTTPatternParams = Record<string, string | string[]>;

export default interface MQTTPattern {
  readonly pattern: string;
  readonly cleanPattern: string;

  matches(topic: string): boolean;
  extract(topic: string): MQTTPatternParams;
  exec(topic: string): MQTTPatternParams | null;
  fill(params: MQTTPatternParams): string;
  fillPattern(params: MQTTPatternParams): MQTTPattern;
}

export type CreateMQTTPattern = (topic: string) => MQTTPattern;
