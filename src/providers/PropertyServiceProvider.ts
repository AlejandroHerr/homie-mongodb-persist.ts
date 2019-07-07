import { asClass } from 'awilix';

import { Provider } from '../libs/Container';

import PropertyService, { MongoPropertyService } from '../services/PropertyService';

const PropertyServiceProvider: Provider<PropertyService> = Object.freeze({
  name: 'propertyService',
  resolver: asClass(MongoPropertyService).singleton(),
});

export default PropertyServiceProvider;
