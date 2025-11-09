import { PhaseValidationService } from '../domain/services/phase-validation.service';
import { NodeRepository } from '../repositories/node.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { Phase } from '@/shared/types/enums';
import { CompletionCondition } from '@/shared/types/value-objects/completion-condition';

export interface UpdateNodeInput {
  nodeId: string;
  label?: string;
  description?: string;
  phase?: Phase;
  priority?: number;
  estimatedDuration?: string;
  positionX?: number;
  positionY?: number;
  completionCondition?: CompletionCondition;
}
export interface UpdateNodeOutput {
  nodeId: string;
  fullId: string;
  label: string;
  updatedAt: Date;
}

export class UpdateNodeUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly phaseValidationService: PhaseValidationService
  ) {}

  async execute(input: UpdateNodeInput): Promise<UpdateNodeOutput> {
    const node = await this.nodeRepository.findById(input.nodeId);
    if (!node) throw new Error(`Node ${input.nodeId} not found`);

    const workflow = await this.workflowRepository.findById(node.workflowDefinitionId);
    if (!workflow) throw new Error(`Workflow ${node.workflowDefinitionId} not found`);

    const template = await this.templateRepository.findById(workflow.rupTemplateId);
    if (!template) throw new Error(`Template ${workflow.rupTemplateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot update nodes in this template');

    if (input.phase && input.phase !== node.phase) {
      if (!workflow.isPhaseAllowed(input.phase)) {
        throw new Error(
          `Phase "${input.phase}" is not allowed for workflow "${workflow.name}". Allowed phases: ${workflow.phases.join(
            ', '
          )}`
        );
      }
    }

    node.update({
      label: input.label,
      description: input.description,
      phase: input.phase,
      priority: input.priority,
      estimatedDuration: input.estimatedDuration,
      positionX: input.positionX,
      positionY: input.positionY,
      completionCondition: input.completionCondition
    });

    await this.nodeRepository.save(node);

    return { nodeId: node.id, fullId: node.fullId, label: node.label, updatedAt: node.updatedAt };
  }
}