import { connect, IClientOptions, AsyncClient } from 'async-mqtt';

import asyncSetTimeout from './asyncSetTimeout';

export default (options?: Partial<IClientOptions>): Promise<AsyncClient> => {
  const client = connect(options);

  const asyncMqttClient = new AsyncClient(client);

  const onConnectPromise = new Promise<AsyncClient>((resolve, reject) => {
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
