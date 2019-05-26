import defaultPropertyAttributes from './defaultPropertyAttributes';
import PropertyAttributes from './PropertyAttributes';

export default class HomieProperty {
  public deviceId: string;

  public nodeId: string;

  public id: string;

  public attributes: PropertyAttributes;

  public value: number | string = '';

  public constructor({
    deviceId,
    nodeId,
    id,
    attributes = {},
    value = '',
  }: {
    deviceId: string;
    nodeId: string;
    id: string;
    attributes?: Partial<PropertyAttributes>;
    value?: number | string;
  }) {
    this.deviceId = deviceId;
    this.nodeId = nodeId;
    this.id = id;
    this.attributes = {
      ...defaultPropertyAttributes,
      ...attributes,
    };
    this.value = value;
  }
}
