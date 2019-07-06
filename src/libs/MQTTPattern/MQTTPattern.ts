export type MQTTPatternParams = Record<string, string | string[]>;

export default interface MQTTPattern {
  clean(pattern: string): string;
  matches(pattern: string, topic: string): boolean;
  extract(pattern: string, topic: string): MQTTPatternParams;
  exec(pattern: string, topic: string): MQTTPatternParams | null;
  fill(pattern: string, params: MQTTPatternParams): string;
}
