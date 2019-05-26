export default interface DeviceAttributes {
  homie: string;
  name: string;
  localip: string;
  mac: string;
  'fw/name': string;
  'fw/version': string;
  implementation: string;
  stats: '';
  'stats/interval': number;
  state: string;
  nodes: string;
}
