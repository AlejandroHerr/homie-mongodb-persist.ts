import { IClientOptions } from 'mqtt';
import deepMerge from '../utils/deepMerge';

import environmentalConfig from './environmentalConfig';
import defaultConfig from './defaultConfig';
import { MongoDbConfig } from '../infrastructure/MongoDbClient';

export interface Config {
  mqtt: IClientOptions;
  mongodb: MongoDbConfig;
}

export default deepMerge(environmentalConfig, defaultConfig) as Config;
