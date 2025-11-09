import { WorkflowRepository } from '../repositories/workflow.repository';
import { TemplateRepository } from '../repositories/template.repository';

export interface DeleteWorkflowInput {
  workflowId: string;
  confirmed?: boolean;
}
export interface DeleteWorkflowOutput {
  success: boolean;
  deletedWorkflowId: string;
  deletedNodeCount: number;
}

export class DeleteWorkflowUseCase {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(input: DeleteWorkflowInput): Promise<DeleteWorkflowOutput> {
    const workflow = await this.workflowRepository.findById(input.workflowId);
    if (!workflow) throw new Error(`Workflow ${input.workflowId} not found`);

    const template = await this.templateRepository.findById(workflow.rupTemplateId);
    if (!template) throw new Error(`Template ${workflow.rupTemplateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot delete workflows from this template');

    const nodeCount = await this.workflowRepository.countNodes(input.workflowId);
    if (nodeCount > 0 && !input.confirmed) {
      throw new Error(`Workflow contains ${nodeCount} node(s). Please confirm deletion as this will also delete all nodes.`);
    }

    await this.workflowRepository.delete(input.workflowId);

    return { success: true, deletedWorkflowId: input.workflowId, deletedNodeCount: nodeCount };
  }
}