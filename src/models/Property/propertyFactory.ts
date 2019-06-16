import Property from './Property';
import PropertyAttributes from './PropertyAttributes';

export default (props: {
  _id?: string;
  deviceId: string;
  nodeId: string;
  id: string;
  attributes?: Partial<PropertyAttributes>;
}) => new Property(props);
