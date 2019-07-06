import { DeviceUniqueFields } from '../../models/Device';
import { NodeUniqueFields } from '../../models/Node';

type Callback = (...args: any[]) => any;

export default interface HomieSubscriptionManager {
  addDeviceSubscription(uniqueFields: DeviceUniqueFields, callback: Callback): Promise<this>;
  updateNodesSubscription(deviceUniqueFields: DeviceUniqueFields, nodeIds: string[], callback: Callback): Promise<this>;
  updatePropertiesSubscription(
    uniqueFields: NodeUniqueFields,
    propertyIds: string[],
    callbacks: { attributeCallback: Callback; valueCallback: Callback },
  ): Promise<this>;
}
