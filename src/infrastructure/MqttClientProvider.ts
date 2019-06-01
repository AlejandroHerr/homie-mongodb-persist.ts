import { connect, IClientOptions } from 'mqtt';
import { AsyncClient } from 'async-mqtt';

import asyncSetTimeout from '../utils/asyncSetTimeout';

export default class AsyncMqttClient extends AsyncClient {
  public async connect({ config }: { config: IClientOptions }) {
    const client = connect(config);

    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    this._client = client;

    const onConnectPromise = new Promise<AsyncClient>((resolve, reject) => {
      const onError = (error: Error): void => {
        reject(error);
      };
      this.once('error', onError);
      this.once(
        'connect',
        (): void => {
          this.removeListener('error', onError);

          resolve(this);
        },
      );
    });

    const onTimeoutPromise = asyncSetTimeout(10000)
      .then(() => this.end())
      .catch(() => {
        throw new Error('Mqtt Client connection tiemout');
      }) as Promise<never>;

    return Promise.race([onConnectPromise, onTimeoutPromise]);
  }
}
