import { MQTTPatternParams } from '../MQTTPattern';

const ATTRIBUTE_PREFIX = '$';
const SEPARATOR = '/';
const SINGLE = '+';
const SINGLE_ATTRIBUTE = '$+';
const ALL = '#';

export const clean = (pattern: string) =>
  pattern
    .split(SEPARATOR)
    .reduce<string[]>((cleanedSegments, currentPattern) => {
      if (currentPattern[0] === ALL) {
        cleanedSegments.push(ALL);

        return cleanedSegments;
      }

      if (currentPattern.includes(SINGLE)) {
        cleanedSegments.push(SINGLE);

        return cleanedSegments;
      }

      cleanedSegments.push(currentPattern);

      return cleanedSegments;
    }, [])
    .join(SEPARATOR);

export const fill = (pattern: string, params: MQTTPatternParams) =>
  pattern
    .split(SEPARATOR)
    .reduce<string[]>((result, currentPattern) => {
      if (currentPattern[0] === ALL) {
        const patternParam = currentPattern.slice(1);
        const paramValue = params[patternParam];

        result.push(Array.isArray(paramValue) ? paramValue.join(SEPARATOR) : paramValue || currentPattern);

        return result;
      }

      if (currentPattern[0] === SINGLE) {
        const patternParam = currentPattern.slice(SINGLE.length);
        const paramValue = params[patternParam] as string;

        result.push(paramValue || currentPattern);

        return result;
      }

      if (currentPattern.startsWith(SINGLE_ATTRIBUTE)) {
        const patternParam = currentPattern.slice(SINGLE_ATTRIBUTE.length);
        const paramValue = params[patternParam] as string;

        result.push((paramValue && `$${paramValue}`) || currentPattern);

        return result;
      }

      result.push(currentPattern);

      return result;
    }, [])
    .join(SEPARATOR);

export const matches = (pattern: string, topic: string): boolean => {
  const patternSegments = pattern.split(SEPARATOR);
  const topicSegments = topic.split(SEPARATOR);

  const match = patternSegments.reduce<boolean | void>((result, currentPattern, index, patterns) => {
    if (result !== undefined) {
      return result;
    }
    const currentTopic = topicSegments[index];

    if (!currentTopic && !currentPattern) {
      return result;
    }

    if (currentPattern[0] === ALL) {
      return index === patterns.length - 1;
    }

    if (currentPattern[0] === SINGLE) {
      return !currentTopic || currentTopic[0] !== ATTRIBUTE_PREFIX ? result : false;
    }

    if (currentPattern.startsWith(SINGLE_ATTRIBUTE)) {
      return currentTopic && currentTopic[0] === ATTRIBUTE_PREFIX ? result : false;
    }

    return currentPattern === currentTopic ? result : false;
  }, undefined);

  if (match === undefined) {
    return patternSegments.length === topicSegments.length;
  }

  return match;
};

const updateState = (
  state: { params: MQTTPatternParams; finished: boolean },
  params: MQTTPatternParams,
  finished: boolean,
) => {
  Object.assign(state.params, params);
  Object.assign(state, { finished });

  return state;
};

export const extract = (pattern: string, topic: string): MQTTPatternParams => {
  const topicSegments = topic.split(SEPARATOR);

  const { params } = pattern.split(SEPARATOR).reduce<{ params: MQTTPatternParams; finished: boolean }>(
    (state, currentPattern, index) => {
      if (state.finished || currentPattern.length === 1) {
        return state;
      }

      if (currentPattern[0] === ALL) {
        return updateState(state, { [currentPattern.slice(1)]: topicSegments.slice(index) }, true);
      }

      if (currentPattern[0] === SINGLE) {
        return updateState(state, { [currentPattern.slice(1)]: topicSegments[index] }, false);
      }

      if (currentPattern.startsWith(SINGLE_ATTRIBUTE)) {
        const currentTopic = topicSegments[index];

        if (!currentTopic.startsWith(ATTRIBUTE_PREFIX)) {
          return state;
        }

        const paramName = currentPattern.slice(SINGLE_ATTRIBUTE.length);
        const paramValue = currentTopic.slice(ATTRIBUTE_PREFIX.length);

        return updateState(state, { [paramName]: paramValue }, false);
      }

      return state;
    },
    { params: {}, finished: false },
  );

  return params;
};

export const exec = (pattern: string, topic: string) => (matches(pattern, topic) && extract(pattern, topic)) || null;
