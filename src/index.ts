import { appContainerFactory } from './libs/AppContainer';
import ConfigProvider from './providers/ConfigProvider';
import DeviceCollectionProvider from './providers/DeviceCollectionProvider';
import DeviceFactoryProvider from './providers/DeviceFactoryProvider';
import DeviceServiceProvider from './providers/DeviceServiceProvider';
import HomieSubscriptionManagerProvider from './providers/HomieSubscriptionManagerProvider';
import LoggerProvider from './providers/LoggerProvider';
import MongoDbClientServiceProvider from './providers/MongoDbClientProvider';
import MQTTClientProvider from './providers/MQTTClientProvider';
import MQTTPatternProvider from './providers/MQTTPatternProvider';
import MQTTRouterProvider from './providers/MQTTRouterProvider';
import NodeCollectionProvider from './providers/NodeCollectionProvider';
import NodeFactoryProvider from './providers/NodeFactoryProvider';
import NodeServiceProvider from './providers/NodeServiceProvider';
import PropertyCollectionProvider from './providers/PropertyCollectionProvider';
import PropertyFactoryProvider from './providers/PropertyFactoryProvider';
import PropertyServiceProvider from './providers/PropertyServiceProvider';

appContainerFactory()
  .register(
    ConfigProvider,
    LoggerProvider,
    HomieSubscriptionManagerProvider,
    MQTTPatternProvider,
    MQTTRouterProvider,
    DeviceFactoryProvider,
    NodeFactoryProvider,
    PropertyFactoryProvider,
    DeviceServiceProvider,
    NodeServiceProvider,
    PropertyServiceProvider,
    MQTTClientProvider,
    MongoDbClientServiceProvider,
    DeviceCollectionProvider,
    NodeCollectionProvider,
    PropertyCollectionProvider,
  )
  .boot()
  .catch(error => {
    console.error(error);
  });
