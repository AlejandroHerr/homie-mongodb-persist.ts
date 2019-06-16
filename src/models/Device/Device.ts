/* eslint-disable no-underscore-dangle */
import HomieDevice from './HomieDevice';
import DeviceAttributes from './DeviceAttributes';

export interface DeviceUniqueFields {
  id: string;
}
export default class Device extends HomieDevice {
  public _id?: string;

  public constructor({ _id, id, attributes }: { _id?: string; id: string; attributes?: Partial<DeviceAttributes> }) {
    super({ id, attributes });

    this._id = _id;
  }

  public getUniqueFields(): DeviceUniqueFields {
    return {
      id: this.id,
    };
  }
}
