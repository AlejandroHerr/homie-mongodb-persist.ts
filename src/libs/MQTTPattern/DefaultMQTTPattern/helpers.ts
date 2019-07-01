import mqttPattern from 'mqtt-pattern';

import { MQTTPatternParams } from '../MQTTPattern';

const SEPARATOR = '/';
const SINGLE = '+';
const ALL = '#';

export const fill = (pattern: string, params: MQTTPatternParams): string => {
  const patternSegments = pattern.split(SEPARATOR);
  const patternLength = patternSegments.length;

  const result: string[] = [];

  for (let i = 0; i < patternLength; i += 1) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];
    const patternParam = currentPattern.slice(1);
    const paramValue = params[patternParam];

    if (patternChar === ALL && paramValue) {
      result.push(Array.isArray(paramValue) ? paramValue.join(SEPARATOR) : paramValue); // Ensure it's an array
    } else if (patternChar === SINGLE && paramValue) {
      result.push(`${paramValue}`);
    } else {
      result.push(currentPattern);
    }
  }

  return result.join(SEPARATOR);
};

export const { clean, matches, extract, exec } = mqttPattern;
