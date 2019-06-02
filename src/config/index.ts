import { IClientOptions } from 'mqtt';
import deepMerge from '../utils/deepMerge';

import defaultConfig from './defaultConfig';
import environmentalConfig from './environmentalConfig';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MqttConfig extends IClientOptions {}

export interface MongoDbConfig {
  host: string;
  port: number;
  dbName: string;
}

export interface Config {
  mqtt: MqttConfig;
  mongodb: MongoDbConfig;
}

export default deepMerge(environmentalConfig, defaultConfig) as Config;
