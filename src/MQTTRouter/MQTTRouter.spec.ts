import { AsyncMqttClient, AsyncClient } from 'async-mqtt';

import Application from '../Application';
import ConfigProvider from '../providers/ConfigProvider';
import MQTTClientProvider from '../providers/MQTTClientProvider';
import createApplicationStore from '../utils/createApplicationStore';

import MQTTRouter from './MQTTRouter';

const applicationStore = createApplicationStore();

const waitForMessage = (mqttClient: AsyncMqttClient) =>
  new Promise(resolve => {
    mqttClient.once('message', () => {
      resolve();
    });
  });

const setup = () => {
  const application = applicationStore.getApplication();

  const mqttRouter = new MQTTRouter(application.container.cradle);

  return {
    mqttClient: application.resolve<AsyncClient>('mqttClient'),
    mqttRouter,
  };
};

describe('MQTTRouter', () => {
  beforeAll(async () => {
    const application = await Application.createApplication()
      .register(ConfigProvider, MQTTClientProvider)
      .boot();

    applicationStore.setApplication(application);
  });

  afterAll(async () => {
    const application = applicationStore.getApplication();

    await application.dispose();
  });
  it('.routeTopic should invoke callback for topic patterns that match', async () => {
    const { mqttClient, mqttRouter } = await setup();

    await mqttClient.subscribe('#');

    const PATTERN_WITH_PARAMS = 'router_with_params/+id/#params';
    const PATTERN_WITHOUT_PARAMS = 'routed_without_params/+/#';

    const callbackWithParams = jest.fn();
    const callbackWithoutParams = jest.fn();

    await Promise.all([
      mqttRouter.routeTopic(PATTERN_WITH_PARAMS, callbackWithParams),
      mqttRouter.routeTopic(PATTERN_WITHOUT_PARAMS, callbackWithoutParams),
    ]);

    await mqttClient.publish('test', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(mqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    await mqttClient.publish('router_with_params/testId/param1/param2', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(mqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(1);
    expect(callbackWithParams).toHaveBeenCalledWith(
      'router_with_params/testId/param1/param2',
      Buffer.from('testMessage'),
      { id: 'testId', params: ['param1', 'param2'] },
    );
    expect(callbackWithoutParams).toHaveBeenCalledTimes(0);

    callbackWithParams.mockReset();
    callbackWithoutParams.mockReset();

    await mqttClient.publish('routed_without_params/testId/param1/param2', 'testMessage', { qos: 0, retain: false });

    await waitForMessage(mqttClient);

    expect(callbackWithParams).toHaveBeenCalledTimes(0);
    expect(callbackWithoutParams).toHaveBeenCalledTimes(1);
    expect(callbackWithoutParams).toHaveBeenCalledWith(
      'routed_without_params/testId/param1/param2',
      Buffer.from('testMessage'),
      {},
    );

    await mqttClient.end();
  });
});
