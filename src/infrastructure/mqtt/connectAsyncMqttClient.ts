import { AsyncClient } from 'async-mqtt';
import { connect, IClientOptions } from 'mqtt';
import { Logger } from 'pino';

import asyncSetTimeout from '../../utils/asyncSetTimeout';

const onTimeout = () =>
  asyncSetTimeout(5000).catch(() => {
    throw new Error('Mqtt Client connection tiemout');
  }) as Promise<never>;

const onConnect = (options: IClientOptions) => {
  const client = connect(options);

  const asyncClient = new AsyncClient(client);

  return new Promise<AsyncClient>((resolve, reject) => {
    const onError = (error: Error): void => {
      reject(error);
    };
    asyncClient.once('error', onError);
    asyncClient.once(
      'connect',
      (): void => {
        asyncClient.removeListener('error', onError);

        resolve(asyncClient);
      },
    );
  });
};

export default ({ logger, options }: { logger: Logger; options: IClientOptions }) =>
  Promise.race([onConnect(options), onTimeout()])
    .then(asyncClient => {
      logger.info(`MQTT client connected to ${options.protocol}://${options.host}:${options.port}`);

      return asyncClient;
    })
    .catch(error => {
      logger.error(error);

      throw error;
    });
