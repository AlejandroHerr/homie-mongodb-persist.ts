import { initDeviceCollection } from '../infrastructure/mongoDb/collections';
import collectionProviderFactory from '../libs/collectionProviderFactory';

export default collectionProviderFactory.make(initDeviceCollection);
