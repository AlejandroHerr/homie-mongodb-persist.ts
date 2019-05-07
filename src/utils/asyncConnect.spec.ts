import { AsyncClient } from 'async-mqtt';

import config from '../config';

import asyncConnect from './asyncConnect';

describe('asyncConnect', () => {
  it('should return a Promise of AsyncClient', async () => {
    const promisedConnect = asyncConnect({
      port: config.MQTT_PORT,
      protocol: config.MQTT_PROTOCOL,
      host: config.MQTT_HOST,
      clientId: `asyncConnectTestClient`,
    });

    expect(promisedConnect).toBeInstanceOf(Promise);

    const client = await promisedConnect;

    expect(client).toBeInstanceOf(AsyncClient);
  });
});
