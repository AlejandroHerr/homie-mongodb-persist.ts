import defaultNodeAttributes from './defaultNodeAttributes';
import NodeAttributes from './NodeAttributes';

export default class HomieNode {
  public deviceId: string;

  public id: string;

  public attributes: NodeAttributes;

  public constructor({
    deviceId,
    id,
    attributes = {},
  }: {
    deviceId: string;
    id: string;
    attributes?: Partial<NodeAttributes>;
  }) {
    this.deviceId = deviceId;
    this.id = id;
    this.attributes = {
      ...defaultNodeAttributes,
      ...attributes,
    };
  }
}
