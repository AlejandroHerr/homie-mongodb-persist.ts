import { asClass } from 'awilix';

import { Provider } from '../libs/Container';

import DeviceService, { MongoDeviceService } from '../services/DeviceService';

const DeviceServiceProvider: Provider<DeviceService> = Object.freeze({
  name: 'deviceService',
  resolver: asClass(MongoDeviceService).singleton(),
});

export default DeviceServiceProvider;
