import defaultDeviceAttributes from './defaultDeviceAttributes';
import Device from './Device';

describe('Device', () => {
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
});
