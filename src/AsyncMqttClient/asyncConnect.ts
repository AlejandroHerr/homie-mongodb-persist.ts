import { connect, IClientOptions } from 'mqtt';

import asyncSetTimeout from '../utils/asyncSetTimeout';

import AsyncMqttClient from './AsyncMqttClient';

export default (brokerUrl?: string, options?: IClientOptions): Promise<AsyncMqttClient> => {
  const client = connect(
    brokerUrl,
    options,
  );

  const asyncMqttClient = new AsyncMqttClient(client);

  const onConnectPromise = new Promise<AsyncMqttClient>((resolve, reject) => {
    const onError = (error: Error): void => {
      reject(error);
    };
    asyncMqttClient.once('error', onError);
    asyncMqttClient.once(
      'connect',
      (): void => {
        asyncMqttClient.removeListener('error', onError);

        resolve(asyncMqttClient);
      },
    );
  });

  const onTimeoutPromise = asyncSetTimeout(options && options.connectTimeout)
    .then(() => asyncMqttClient.end())
    .catch(() => {
      throw new Error('Mqtt Client connects tiemout');
    }) as Promise<never>;

  return Promise.race([onConnectPromise, onTimeoutPromise]);
};
