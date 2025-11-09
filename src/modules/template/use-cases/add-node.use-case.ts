import { FlowTemplateNodeEntity } from '../domain/entities/flow-template-node.entity';
import { PhaseValidationService } from '../domain/services/phase-validation.service';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { NodeRepository } from '../repositories/node.repository';
import { DocTypeRepository } from '../repositories/doc-type.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { Phase } from '@/shared/types/enums';
import { CompletionCondition } from '@/shared/types/value-objects/completion-condition';

export interface AddNodeInput {
  workflowId: string;
  nodeId: string;
  docTypeId: string;
  label: string;
  description?: string;
  phase?: Phase;
  priority?: number;
  estimatedDuration?: string;
  positionX: number;
  positionY: number;
  completionCondition: CompletionCondition;
}
export interface AddNodeOutput {
  nodeId: string;
  fullId: string;
  label: string;
  phase: Phase;
  warnings?: string[];
}

export class AddNodeUseCase {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly docTypeRepository: DocTypeRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly phaseValidationService: PhaseValidationService
  ) {}

  async execute(input: AddNodeInput): Promise<AddNodeOutput> {
    const warnings: string[] = [];

    const workflow = await this.workflowRepository.findById(input.workflowId);
    if (!workflow) throw new Error(`Workflow ${input.workflowId} not found`);

    const template = await this.templateRepository.findById(workflow.rupTemplateId);
    if (!template) throw new Error(`Template ${workflow.rupTemplateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot add nodes to this template');

    const docType = await this.docTypeRepository.findById(input.docTypeId);
    if (!docType) throw new Error(`DocType ${input.docTypeId} not found`);

    const fullId = `${input.workflowId}.${input.nodeId}`;
    const exists = await this.nodeRepository.fullIdExists(fullId);
    if (exists) throw new Error(`Node with fullId "${fullId}" already exists`);

    let phase = input.phase;
    if (!phase) {
      const docTypePhases = await this.docTypeRepository.getPhases(input.docTypeId);
      const suggestion = await this.phaseValidationService.suggestPhaseForNode(workflow, docTypePhases);
      if (!suggestion.hasIntersection) {
        warnings.push(
          `DocType phases (${docTypePhases.join(', ')}) do not intersect with workflow phases (${workflow.phases.join(
            ', '
          )}). Using workflow's default phase: ${this.phaseValidationService.getDefaultPhase(workflow)}`
        );
      }
      phase = suggestion.phase ?? this.phaseValidationService.getDefaultPhase(workflow);
    }

    if (!workflow.isPhaseAllowed(phase)) {
      throw new Error(
        `Phase "${phase}" is not allowed for workflow "${workflow.name}". Allowed phases: ${workflow.phases.join(', ')}`
      );
    }

    const node = FlowTemplateNodeEntity.create({
      workflowDefinitionId: input.workflowId,
      nodeId: input.nodeId,
      docTypeId: input.docTypeId,
      label: input.label,
      description: input.description,
      phase,
      workflow: workflow.name,
      priority: input.priority,
      estimatedDuration: input.estimatedDuration,
      positionX: input.positionX,
      positionY: input.positionY,
      completionCondition: input.completionCondition
    });

    await this.nodeRepository.save(node);

    return {
      nodeId: node.id,
      fullId: node.fullId,
      label: node.label,
      phase: node.phase,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}