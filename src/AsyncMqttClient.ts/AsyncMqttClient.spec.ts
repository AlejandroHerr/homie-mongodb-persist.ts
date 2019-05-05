import { connect } from 'mqtt';

import config from '../config';
import AsyncMqttClient from './AsyncMqttClient';
import asyncDelay from '../utils/asyncDelay';

const waitForMessage = (client: AsyncMqttClient) =>
  new Promise(resolve => {
    client.once('message', () => {
      resolve();
    });
  });

const setup = (): Promise<AsyncMqttClient> =>
  new Promise(resolve => {
    const client = connect({
      port: config.MQTT_PORT,
      protocol: config.MQTT_PROTOCOL,
      host: config.MQTT_HOST,
      clientId: config.MQTT_CLIENT_NAME,
    });
    const asyncMqttClient = new AsyncMqttClient(client);

    client.on('connect', () => {
      resolve(asyncMqttClient);
    });
  });

describe('AsyncMqttClient', () => {
  it('.subscribeToTopic should invoke callback for topic patterns that match', async () => {
    const asyncMqttClient = await setup();

    await asyncMqttClient.subscribe('#');

    const PATTERN_WITH_PARAMS = 'test_with_params/+id/#params';
    const PATTERN_WITHOUT_PARAMS = 'test_without_params/+/#';

    const callbackWithParams = jest.fn();
    const callbackWithoutParams = jest.fn();

    await Promise.all([
      asyncMqttClient.subscribeToTopic(PATTERN_WITH_PARAMS, callbackWithParams),
      asyncMqttClient.subscribeToTopic(PATTERN_WITHOUT_PARAMS, callbackWithoutParams),
    ]);

    await asyncMqttClient.publish('test', 'testMessage', { qos: 2 });

    await waitForMessage(asyncMqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    await asyncMqttClient.publish('test_with_params/testId/param1/param2', 'testMessage', { qos: 2 });

    await waitForMessage(asyncMqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(1);
    expect(callbackWithParams).toHaveBeenCalledWith(
      'test_with_params/testId/param1/param2',
      Buffer.from('testMessage'),
      { id: 'testId', params: ['param1', 'param2'] },
    );
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    callbackWithParams.mockReset();
    callbackWithoutParams.mockReset();

    await asyncMqttClient.publish('test_without_params/testId/param1/param2', 'testMessage', { qos: 2 });

    await waitForMessage(asyncMqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(1);
    expect(callbackWithoutParams).toHaveBeenCalledWith(
      'test_without_params/testId/param1/param2',
      Buffer.from('testMessage'),
      {},
    );
  });
});
