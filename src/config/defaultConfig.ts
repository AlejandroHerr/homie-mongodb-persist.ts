import { IClientOptions } from 'async-mqtt';

export default {
  mqtt: {
    host: 'localhost',
    port: 1883,
    protocol: 'mqtt' as IClientOptions['protocol'],
  },
  mongodb: {
    host: 'localhost',
    port: 27017,
  },
};
