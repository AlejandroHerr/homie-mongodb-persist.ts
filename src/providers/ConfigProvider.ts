import { asValue } from 'awilix';

import { Provider } from '../Application';
import config, { Config } from '../config';

const ConfigProvider: Provider<Config> = Object.freeze({ name: 'config', resolver: asValue(config) });

export default ConfigProvider;
