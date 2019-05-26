import defaultDeviceAttributes from './defaultDeviceAttributes';
import DeviceAttributes from './DeviceAttributes';

export default class HomieDevice {
  public id: string;

  public attributes: DeviceAttributes;

  public constructor({ id, attributes = {} }: { id: string; attributes?: Partial<DeviceAttributes> }) {
    this.id = id;
    this.attributes = {
      ...defaultDeviceAttributes,
      ...attributes,
    };
  }
}
