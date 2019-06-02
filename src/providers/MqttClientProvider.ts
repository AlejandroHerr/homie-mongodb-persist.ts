import { asFunction } from 'awilix';
import { AsyncClient } from 'async-mqtt';
import { Logger } from 'pino';

import { AsyncProvider } from '../Application';
import { Config } from '../config';
import connectAsyncMqttClient from '../infrastructure/mqtt/connectAsyncMqttClient';

const MqttClientProvier: AsyncProvider<AsyncClient> = Object.freeze({
  name: 'mqttClient',
  async asyncResolver({ config, logger }: { config: Config; logger: Logger }) {
    const asyncMqttClient = await connectAsyncMqttClient({ logger, options: config.mqtt });

    return asFunction(() => asyncMqttClient)
      .singleton()
      .disposer(mqttClient => mqttClient.end());
  },
});

export default MqttClientProvier;
