import Device from './Device';
import DeviceAttributes from './DeviceAttributes';

export default (props: { _id?: string; id: string; attributes?: Partial<DeviceAttributes> }) => new Device(props);
