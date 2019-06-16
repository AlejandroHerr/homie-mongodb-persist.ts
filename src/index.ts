import { appContainerFactory } from './libs/AppContainer';
import ConfigProvider from './providers/ConfigProvider';
import DeviceCollectionProvider from './providers/DeviceCollectionProvider';
import DeviceFactoryProvider from './providers/DeviceFactoryProvider';
import LoggerProvider from './providers/LoggerProvider';
import MongoDbClientServiceProvider from './providers/MongoDbClientProvider';
import MQTTClientProvider from './providers/MQTTClientProvider';
import MQTTTopicRouterProvider from './providers/MQTTTopicRouterProvider';
import NodeCollectionProvider from './providers/NodeCollectionProvider';
import NodeFactoryProvider from './providers/NodeFactoryProvider';
import PropertyCollectionProvider from './providers/PropertyCollectionProvider';
import PropertyFactoryProvider from './providers/PropertyFactoryProvider';

appContainerFactory()
  .register(
    ConfigProvider,
    DeviceFactoryProvider,
    LoggerProvider,
    MQTTTopicRouterProvider,
    NodeFactoryProvider,
    PropertyFactoryProvider,
    MongoDbClientServiceProvider,
    MQTTClientProvider,
    DeviceCollectionProvider,
    NodeCollectionProvider,
    PropertyCollectionProvider,
  )
  .boot()
  .catch(error => {
    console.error(error);
  });
