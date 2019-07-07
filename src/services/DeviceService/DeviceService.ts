import Device, { DeviceUniqueFields } from '../../models/Device';

export default interface DeviceService {
  findOneById(modelFactory: DeviceUniqueFields): Promise<Device | null>;
  createOneById(modelFactory: DeviceUniqueFields): Promise<this>;
  updateAttributeById(modelFactory: DeviceUniqueFields, attribute: string, value: string | number): Promise<this>;
}
