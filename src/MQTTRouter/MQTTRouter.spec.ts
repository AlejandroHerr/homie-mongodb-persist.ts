import { connect, AsyncMqttClient } from 'async-mqtt';

import config from '../config';
import MQTTRouter from './MQTTRouter';

const waitForMessage = (client: AsyncMqttClient) =>
  new Promise(resolve => {
    client.once('message', () => {
      resolve();
    });
  });

const setup = (): Promise<{ client: AsyncMqttClient; mqttRouter: MQTTRouter }> =>
  new Promise(resolve => {
    const client = connect({
      port: config.MQTT_PORT,
      protocol: config.MQTT_PROTOCOL,
      host: config.MQTT_HOST,
      clientId: `MqttRouterTestClient`,
    });

    client.on('connect', () => {
      const mqttRouter = new MQTTRouter(client);
      resolve({ client, mqttRouter });
    });
  });

describe('MQTTRouter', () => {
  it('.routeTopic should invoke callback for topic patterns that match', async () => {
    const { client, mqttRouter } = await setup();

    await client.subscribe('#');

    const PATTERN_WITH_PARAMS = 'router_with_params/+id/#params';
    const PATTERN_WITHOUT_PARAMS = 'routed_without_params/+/#';

    const callbackWithParams = jest.fn();
    const callbackWithoutParams = jest.fn();

    await Promise.all([
      mqttRouter.routeTopic(PATTERN_WITH_PARAMS, callbackWithParams),
      mqttRouter.routeTopic(PATTERN_WITHOUT_PARAMS, callbackWithoutParams),
    ]);

    await client.publish('test', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(client);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    await client.publish('router_with_params/testId/param1/param2', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(client);

    expect(callbackWithParams).toHaveBeenCalledTimes(1);
    expect(callbackWithParams).toHaveBeenCalledWith(
      'router_with_params/testId/param1/param2',
      Buffer.from('testMessage'),
      { id: 'testId', params: ['param1', 'param2'] },
    );
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    callbackWithParams.mockReset();
    callbackWithoutParams.mockReset();

    await client.publish('routed_without_params/testId/param1/param2', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(client);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(1);
    expect(callbackWithoutParams).toHaveBeenCalledWith(
      'routed_without_params/testId/param1/param2',
      Buffer.from('testMessage'),
      {},
    );

    await client.end();
  });
});
