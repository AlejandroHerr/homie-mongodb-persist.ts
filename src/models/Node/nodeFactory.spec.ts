import nodeFactory from './nodeFactory';
import Node from './Node';

describe('models/Node/nodeFactory', () => {
  it('should create a new Node', () => {
    const props = {
      deviceId: 'testDeviceId',
      id: 'testId',
    };
    const node = nodeFactory(props);

    expect(node).toBeInstanceOf(Node);
  });
});
