import Node, { NodeUniqueFields } from '../../models/Node';

export default interface NodeService {
  findOneById(uniqueFields: NodeUniqueFields): Promise<Node | null>;
  createOneById(uniqueFields: NodeUniqueFields): Promise<this>;
  updateAttributeById(uniqueFields: NodeUniqueFields, attribute: string, value: string | number): Promise<this>;
}
