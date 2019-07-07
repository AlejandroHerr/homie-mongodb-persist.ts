import Property, { PropertyUniqueFields } from '../../models/Property';

export default interface PropertyService {
  findOneById(uniqueFields: PropertyUniqueFields): Promise<Property | null>;
  createOneById(uniqueFields: PropertyUniqueFields): Promise<this>;
  updateAttributeById(uniqueFields: PropertyUniqueFields, attribute: string, value: string | number): Promise<this>;
}
