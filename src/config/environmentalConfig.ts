import { IClientOptions } from 'async-mqtt';

export default {
  mqtt: {
    host: process.env.MQTT_HOST,
    port: (process.env.MQTT_PORT as unknown) as number,
    protocol: process.env.MQTT_PROTOCOL as IClientOptions['protocol'],
    clientName: process.env.MQTT_CLIENT_NAME as string,
  },
  mongodb: {
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    dbName: process.env.MONGODB_DATABASE as string,
  },
};
