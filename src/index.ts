import Application from './Application';
import MQTTClientProvider from './providers/MQTTClientProvider';
import MongoDbClientServiceProvider from './providers/MongoDbClientProvider';
import MongoDbCollectionsProvider from './providers/MongoDbCollectionsProvider';
import ConfigProvider from './providers/ConfigProvider';
import LoggerProvider from './providers/LoggerProvier';

Application.createApplication()
  .register(
    ConfigProvider,
    LoggerProvider,
    MongoDbClientServiceProvider,
    MongoDbCollectionsProvider,
    MQTTClientProvider,
  )
  .boot()
  .catch(error => {
    console.error(error);
  });
