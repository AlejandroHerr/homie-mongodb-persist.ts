import { CreateMQTTPattern } from '../MQTTPattern';

import HomieMQTTPattern from './HomieMQTTPattern';

const createHomieMQTTPattern: CreateMQTTPattern = (pattern: string) => new HomieMQTTPattern(pattern);

export default createHomieMQTTPattern;
