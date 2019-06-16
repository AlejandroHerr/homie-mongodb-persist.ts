import { asValue } from 'awilix';

import config, { Config } from '../config';
import { Provider } from '../libs/Container';

const ConfigProvider: Provider<Config> = Object.freeze({ name: 'config', resolver: asValue(config) });

export default ConfigProvider;
