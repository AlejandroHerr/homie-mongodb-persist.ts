import deviceFactory from './deviceFactory';
import Device from './Device';

describe('models/Device/deviceFactory', () => {
  it('should create a new Device', () => {
    const props = {
      id: 'testId',
    };
    const device = deviceFactory(props);

    expect(device).toBeInstanceOf(Device);
  });
});
