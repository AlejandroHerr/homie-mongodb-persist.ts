import { initDeviceCollection } from '../infrastructure/mongoDb/collections';
import collectionProviderFactory from '../libs/collectionProviderFactory';

const DeviceCollectionProvider = collectionProviderFactory.make(initDeviceCollection);

export default DeviceCollectionProvider;
