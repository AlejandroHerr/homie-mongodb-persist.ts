import { IClientOptions } from 'mqtt';
import deepMerge from '../utils/deepMerge';

import { MongoDbConfig } from '../infrastructure/mongoDb/MongoDbClient';

import defaultConfig from './defaultConfig';
import environmentalConfig from './environmentalConfig';

export interface Config {
  mqtt: IClientOptions;
  mongodb: MongoDbConfig;
}

export default deepMerge(environmentalConfig, defaultConfig) as Config;
