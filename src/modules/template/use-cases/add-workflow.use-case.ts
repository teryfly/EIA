import { WorkflowDefinition } from '../domain/aggregates/workflow-definition';
import { PhaseValidationService } from '../domain/services/phase-validation.service';
import { TemplateRepository } from '../repositories/template.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { Phase } from '@/shared/types/enums';

export interface AddWorkflowInput {
  templateId: string;
  name: string;
  code: string;
  priority?: number;
  estimatedDuration?: string;
  description?: string;
  phases: Phase[];
}
export interface AddWorkflowOutput {
  workflowId: string;
  name: string;
  code: string;
  phases: Phase[];
  warnings?: string[];
}

export class AddWorkflowUseCase {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly phaseValidationService: PhaseValidationService
  ) {}

  async execute(input: AddWorkflowInput): Promise<AddWorkflowOutput> {
    const template = await this.templateRepository.findById(input.templateId);
    if (!template) throw new Error(`Template ${input.templateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot edit this template');

    const codeExists = await this.workflowRepository.codeExistsInTemplate(input.templateId, input.code);
    if (codeExists) throw new Error(`Workflow with code "${input.code}" already exists in this template`);

    const workflow = WorkflowDefinition.create({
      rupTemplateId: input.templateId,
      name: input.name,
      code: input.code,
      priority: input.priority,
      estimatedDuration: input.estimatedDuration,
      description: input.description,
      phases: input.phases
    });

    const phaseValidation = await this.phaseValidationService.validateWorkflowPhases(workflow);
    await this.workflowRepository.save(workflow);

    return {
      workflowId: workflow.id,
      name: workflow.name,
      code: workflow.code,
      phases: workflow.phases,
      warnings: phaseValidation.warnings
    };
  }
}