import DeviceAttributes from './DeviceAttributes';

const defaultDeviceAttributes: DeviceAttributes = {
  homie: '3.0.1',
  name: 'Homie Device',
  localip: '0.0.0.0',
  mac: '00:00:00:00:00:00',
  'fw/name': 'firmware',
  'fw/version': '0.0.0',
  implementation: 'homie.js',
  stats: '',
  'stats/interval': 0,
  state: 'init',
  nodes: '',
};

export default defaultDeviceAttributes;
