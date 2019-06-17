import { AsyncClient } from 'async-mqtt';

const waitForMQTTMessage = async (mqttClient: AsyncClient): Promise<void> => {
  await mqttClient.subscribe('#');
  return new Promise(resolve =>
    mqttClient.once('message', async () => {
      await mqttClient.unsubscribe('#');

      resolve();
    }),
  );
};

const publishAndWaitForMessage = async (mqttClient: AsyncClient, topic: string, value: string) => {
  const waitForMQTTMessagePromise = waitForMQTTMessage(mqttClient);

  await mqttClient.publish(topic, value);

  return waitForMQTTMessagePromise;
};

export default publishAndWaitForMessage;
