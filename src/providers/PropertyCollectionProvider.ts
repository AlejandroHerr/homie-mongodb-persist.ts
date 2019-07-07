import { initPropertyCollection } from '../infrastructure/mongoDb/collections';
import collectionProviderFactory from '../libs/collectionProviderFactory';

const PropertyCollectionProvider = collectionProviderFactory.make(initPropertyCollection);

export default PropertyCollectionProvider;
