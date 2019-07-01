import { CreateMQTTPattern } from '../MQTTPattern';

import DefaultMQTTPattern from './DefaultMQTTPattern';

const createDefaultMQTTPattern: CreateMQTTPattern = (topic: string) => new DefaultMQTTPattern(topic);

export default createDefaultMQTTPattern;
