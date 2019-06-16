import { asValue } from 'awilix';

import { Provider } from '../Application';
import deviceFactory from '../models/Device/deviceFactory';

const DeviceFactoryProvider: Provider<typeof deviceFactory> = Object.freeze({
  name: 'deviceFactory',
  resolver: asValue(deviceFactory),
});

export default DeviceFactoryProvider;
