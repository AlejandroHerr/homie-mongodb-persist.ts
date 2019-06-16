/* eslint-disable no-underscore-dangle */
import HomieProperty from './HomieProperty';
import PropertyAttributes from './PropertyAttributes';

export interface PropertyUniqueFields {
  deviceId: string;
  nodeId: string;
  id: string;
}
export default class Property extends HomieProperty {
  public _id?: string;

  public constructor({
    _id,
    deviceId,
    nodeId,
    id,
    attributes,
    value,
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

  public getUniqueFields(): PropertyUniqueFields {
    return {
      deviceId: this.deviceId,
      nodeId: this.nodeId,
      id: this.id,
    };
  }
}
