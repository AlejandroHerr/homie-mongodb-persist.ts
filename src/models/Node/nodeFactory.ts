import Node from './Node';
import NodeAttributes from './NodeAttributes';

export default (props: { _id?: string; deviceId: string; id: string; attributes?: Partial<NodeAttributes> }) =>
  new Node(props);
