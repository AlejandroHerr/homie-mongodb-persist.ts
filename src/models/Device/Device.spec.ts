import defaultDeviceAttributes from './defaultDeviceAttributes';
import Device, { DeviceUniqueFields } from './Device';

describe('models/Device', () => {
  it('should create an Device with default values', () => {
    const props = {
      id: 'testId',
    };
    const device = new Device(props);

    expect(device.id).toBe(props.id);
    expect(device.attributes).toEqual(defaultDeviceAttributes);
  });

  it('should create an Device with provided values', () => {
    const props = {
      id: 'testId',
      attributes: {
        name: 'Test Device',
      },
    };
    const device = new Device(props);

    expect(device.id).toBe(props.id);
    expect(device.attributes).toEqual({
      ...defaultDeviceAttributes,
      ...props.attributes,
    });
  });

  it('.getUniqueFields should return deviceUniqueFields', () => {
    const props = {
      id: 'testId',
    };
    const device = new Device(props);

    const deviceUniqueFields: DeviceUniqueFields = device.getUniqueFields();

    expect(deviceUniqueFields).toEqual({ id: 'testId' });
  });
});
