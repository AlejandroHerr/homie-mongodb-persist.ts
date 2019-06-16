import propertyFactory from './propertyFactory';
import Property from './Property';

describe('models/Property/propertyFactory', () => {
  it('should create a new Property', () => {
    const props = {
      deviceId: 'testDeviceId',
      nodeId: 'testNodeId',
      id: 'testId',
    };
    const property = propertyFactory(props);

    expect(property).toBeInstanceOf(Property);
  });
});
