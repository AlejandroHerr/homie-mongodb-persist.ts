import { initNodeCollection } from '../infrastructure/mongoDb/collections';
import collectionProviderFactory from '../libs/collectionProviderFactory';

const NodeCollectionProvider = collectionProviderFactory.make(initNodeCollection);

export default NodeCollectionProvider;
