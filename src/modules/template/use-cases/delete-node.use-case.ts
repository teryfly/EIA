import { NodeRepository } from '../repositories/node.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { TemplateRepository } from '../repositories/template.repository';

export interface DeleteNodeInput {
  nodeId: string;
}
export interface DeleteNodeOutput {
  success: boolean;
  deletedNodeId: string;
  fullId: string;
}

export class DeleteNodeUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(input: DeleteNodeInput): Promise<DeleteNodeOutput> {
    const node = await this.nodeRepository.findById(input.nodeId);
    if (!node) throw new Error(`Node ${input.nodeId} not found`);

    const workflow = await this.workflowRepository.findById(node.workflowDefinitionId);
    if (!workflow) throw new Error(`Workflow ${node.workflowDefinitionId} not found`);

    const template = await this.templateRepository.findById(workflow.rupTemplateId);
    if (!template) throw new Error(`Template ${workflow.rupTemplateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot delete nodes from this template');

    const fullId = node.fullId;
    await this.nodeRepository.delete(input.nodeId);

    return { success: true, deletedNodeId: input.nodeId, fullId };
  }
}