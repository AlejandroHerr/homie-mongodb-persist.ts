import MQTTPattern, { MQTTPatternParams } from '../MQTTPattern';

import { clean, matches, extract, exec, fill } from './helpers';

export default class HomieMQTTPattern implements MQTTPattern {
  public readonly pattern: string;

  public readonly cleanPattern: string;

  public constructor(pattern: string) {
    this.pattern = pattern;
    this.cleanPattern = clean(pattern);
  }

  public matches(topic: string) {
    return matches(this.pattern, topic);
  }

  public extract(topic: string) {
    return extract(this.pattern, topic);
  }

  public exec(topic: string) {
    return exec(this.pattern, topic);
  }

  public fill(params: MQTTPatternParams) {
    return fill(this.pattern, params);
  }

  public fillPattern(params: MQTTPatternParams) {
    return new HomieMQTTPattern(fill(this.pattern, params));
  }
}
