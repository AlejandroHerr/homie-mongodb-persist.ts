import { asFunction } from 'awilix';
import { AsyncClient } from 'async-mqtt';
import { Logger } from 'pino';

import { Config } from '../config';
import connectAsyncMqttClient from '../infrastructure/mqtt/connectAsyncMqttClient';
import { BootableProvider } from '../libs/Container';

const MQTTClientProvider: BootableProvider<AsyncClient> = Object.freeze({
  name: 'mqttClient',
  async bootableResolver({ config, logger }: { config: Config; logger: Logger }) {
    const asyncMqttClient = await connectAsyncMqttClient({ logger, options: config.mqtt });

    return asFunction(() => asyncMqttClient)
      .singleton()
      .disposer(mqttClient => mqttClient.end());
  },
});

export default MQTTClientProvider;
