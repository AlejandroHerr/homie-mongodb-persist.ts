import { AsyncClient } from 'async-mqtt';

import ConfigProvider from '../providers/ConfigProvider';
import LoggerProvider from '../providers/LoggerProvider';
import MQTTClientProvider from '../providers/MQTTClientProvider';
import createAppContainerStore from './createAppContainerStore';
import publishAndWaitForMessage from './publishAndWaitForMessage';

const appContainerStore = createAppContainerStore();

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();

  return {
    mqttClient: appContainer.resolve<AsyncClient>('mqttClient'),
  };
};

describe('utils/publishAndWaitForMessage', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(ConfigProvider, LoggerProvider, MQTTClientProvider)
      .boot();
  });

  afterAll(async () => {
    await appContainerStore.getAppContainer().dispose();
  });

  it('should publish and wait for the message', async () => {
    const { mqttClient } = setup();

    const topic = 'publishAndWaitForMessage';
    const messageHandler = jest.fn();
    const value = 'topicvalue';

    await mqttClient.subscribe(topic);
    mqttClient.on('message', messageHandler);

    await expect(publishAndWaitForMessage(mqttClient, topic, value)).resolves.toBeUndefined();

    expect(messageHandler).toHaveBeenCalled();
  });
});
