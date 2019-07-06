import MQTTPattern from '../MQTTPattern';

import { clean, matches, extract, exec, fill } from './helpers';

const DefaultMQTTPattern: MQTTPattern = Object.freeze({
  clean,
  matches,
  extract,
  exec,
  fill,
});

export default DefaultMQTTPattern;
