/* eslint-disable no-underscore-dangle */
import HomieNode from './HomieNode';
import NodeAttributes from './NodeAttributes';

export interface NodeUniqueFields {
  deviceId: string;
  id: string;
}

export default class Node extends HomieNode {
  public _id?: string;

  public constructor({
    _id,
    deviceId,
    id,
    attributes,
  }: {
    _id?: string;
    deviceId: string;
    id: string;
    attributes?: Partial<NodeAttributes>;
  }) {
    super({ deviceId, id, attributes });

    this._id = _id;
  }

  public getUniqueFields(): NodeUniqueFields {
    return {
      deviceId: this.deviceId,
      id: this.id,
    };
  }
}
