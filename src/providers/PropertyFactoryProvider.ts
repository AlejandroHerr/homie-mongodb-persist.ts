import { asValue } from 'awilix';

import { Provider } from '../Application';
import propertyFactory from '../models/Property/propertyFactory';

const PropertyFactoryProvider: Provider<typeof propertyFactory> = Object.freeze({
  name: 'propertyFactory',
  resolver: asValue(propertyFactory),
});

export default PropertyFactoryProvider;
