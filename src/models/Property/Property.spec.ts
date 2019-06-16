import defaultPropertyAttributes from './defaultPropertyAttributes';
import Property from './Property';
import { PropertyUniqueFields } from '.';

describe('models/Property', () => {
  it('should create an Property with default values', () => {
    const props = {
      deviceId: 'testDeviceId',
      nodeId: 'testNodeId',
      id: 'testId',
    };
    const property = new Property(props);

    expect(property.deviceId).toBe(props.deviceId);
    expect(property.nodeId).toBe(props.nodeId);
    expect(property.id).toBe(props.id);
    expect(property.attributes).toEqual(defaultPropertyAttributes);
    expect(property.value).toBe('');
  });

  it('should create an Property with provided values', () => {
    const props = {
      deviceId: 'testDeviceId',
      nodeId: 'testNodeId',
      id: 'testId',
      attributes: {
        name: 'Test Property',
      },
      value: '7',
    };
    const property = new Property(props);

    expect(property.deviceId).toBe(props.deviceId);
    expect(property.nodeId).toBe(props.nodeId);
    expect(property.id).toBe(props.id);
    expect(property.attributes).toEqual({
      ...defaultPropertyAttributes,
      ...props.attributes,
    });
    expect(property.value).toBe(props.value);
  });

  it('should create an Property with provided values', () => {
    const props = {
      deviceId: 'testDeviceId',
      nodeId: 'testNodeId',
      id: 'testId',
      attributes: {
        name: 'Test Property',
      },
      value: '7',
    };
    const property = new Property(props);

    expect(property.deviceId).toBe(props.deviceId);
    expect(property.nodeId).toBe(props.nodeId);
    expect(property.id).toBe(props.id);
    expect(property.attributes).toEqual({
      ...defaultPropertyAttributes,
      ...props.attributes,
    });
    expect(property.value).toBe(props.value);
  });

  it('.getUniqueFields should return propertyUniqueFields', () => {
    const props = {
      deviceId: 'testDeviceId',
      nodeId: 'testNodeId',
      id: 'testId',
    };
    const property = new Property(props);

    const propertyUniqueFields: PropertyUniqueFields = property.getUniqueFields();

    expect(propertyUniqueFields).toEqual({ deviceId: 'testDeviceId', nodeId: 'testNodeId', id: 'testId' });
  });
});
