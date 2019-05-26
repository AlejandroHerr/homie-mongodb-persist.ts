/* eslint-disable no-underscore-dangle */
import HomieDevice from './HomieDevice';
import DeviceAttributes from './DeviceAttributes';

export default class Device extends HomieDevice {
  public _id?: string;

  public constructor({
    _id,
    id,
    attributes = {},
  }: {
    _id?: string;
    id: string;
    attributes?: Partial<DeviceAttributes>;
  }) {
    super({ id, attributes });

    this._id = _id;
  }
}
