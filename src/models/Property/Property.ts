/* eslint-disable no-underscore-dangle */
import HomieProperty from './HomieProperty';
import PropertyAttributes from './PropertyAttributes';

export default class Property extends HomieProperty {
  public _id?: string;

  public constructor({
    _id,
    deviceId,
    nodeId,
    id,
    attributes = {},
    value = '',
  }: {
    _id?: string;
    deviceId: string;
    nodeId: string;
    id: string;
    attributes?: Partial<PropertyAttributes>;
    value?: number | string;
  }) {
    super({ deviceId, nodeId, id, attributes, value });

    this._id = _id;
  }
}
