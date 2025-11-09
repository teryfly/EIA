import { PhaseValidationService } from '../domain/services/phase-validation.service';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { Phase } from '@/shared/types/enums';

export interface UpdateWorkflowInput {
  workflowId: string;
  name?: string;
  description?: string;
  estimatedDuration?: string;
  priority?: number;
  phases?: Phase[];
}
export interface UpdateWorkflowOutput {
  workflowId: string;
  name: string;
  updatedAt: Date;
  phaseChangeWarning?: string;
  affectedNodeCount?: number;
}

export class UpdateWorkflowUseCase {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly phaseValidationService: PhaseValidationService
  ) {}

  async execute(input: UpdateWorkflowInput): Promise<UpdateWorkflowOutput> {
    const workflow: any = await this.workflowRepository.findByIdWithNodes(input.workflowId);
    if (!workflow) throw new Error(`Workflow ${input.workflowId} not found`);

    const template = await this.templateRepository.findById(workflow.rupTemplateId);
    if (!template) throw new Error(`Template ${workflow.rupTemplateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot edit workflows in this template');

    let phaseChangeWarning: string | undefined;
    let affectedNodeCount: number | undefined;
    if (input.phases && JSON.stringify(input.phases) !== JSON.stringify(workflow.phases)) {
      const impact = this.phaseValidationService.analyzePhaseRangeChange(workflow, input.phases);
      if (impact.hasImpact) {
        affectedNodeCount = impact.affectedNodes.length;
        phaseChangeWarning = `Changing workflow phases will affect ${affectedNodeCount} node(s). These nodes will have invalid phases and must be updated.`;
      }
    }

    workflow.update({
      name: input.name,
      description: input.description,
      estimatedDuration: input.estimatedDuration,
      priority: input.priority,
      phases: input.phases
    });

    await this.workflowRepository.save(workflow);

    return {
      workflowId: workflow.id,
      name: workflow.name,
      updatedAt: workflow.updatedAt,
      phaseChangeWarning,
      affectedNodeCount
    };
  }
}