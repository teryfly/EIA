import { Phase } from '@/shared/types/enums';
import { WorkflowDefinition } from '../aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../entities/flow-template-node.entity';
import { ValidationIssueEntity } from '../entities/validation-issue.entity';
import { PhaseMappingRepository } from '../../repositories/phase-mapping.repository';

export class PhaseValidationService {
  constructor(private readonly phaseMappingRepository: PhaseMappingRepository) {}

  async validateNodePhase(
    templateId: string,
    workflow: WorkflowDefinition,
    node: FlowTemplateNodeEntity
  ): Promise<ValidationIssueEntity | null> {
    if (!workflow.isPhaseAllowed(node.phase)) {
      return ValidationIssueEntity.createPhaseInvalid(templateId, workflow.id, node.id, {
        nodePhase: node.phase,
        allowedPhases: workflow.phases,
        nodeName: node.label,
        workflowName: workflow.name
      });
    }
    return null;
  }

  async validateWorkflowPhases(
    workflow: WorkflowDefinition
  ): Promise<{ valid: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    const mapping = await this.phaseMappingRepository.findByWorkflowCode(workflow.code);
    if (!mapping) {
      return { valid: true, warnings: [] };
    }
    const hasNonStandard = workflow.phases.some((p) => !mapping.isPhaseAllowed(p));
    if (hasNonStandard) {
      warnings.push(
        `Workflow "${workflow.name}" has phases that differ from standard RUP mapping. ` +
          `Standard phases: ${mapping.getStandardPhasesDisplay()}. ` +
          `Current phases: ${workflow.phases.join(', ')}.`
      );
    }
    return { valid: true, warnings };
  }

  getDefaultPhase(workflow: WorkflowDefinition): Phase {
    if (workflow.phases.length === 0) return Phase.Inception;
    if (workflow.phases.includes(Phase.Inception)) return Phase.Inception;
    return workflow.phases[0];
  }

  async getAllowedPhasesForWorkflow(workflowCode: string): Promise<Phase[]> {
    const mapping = await this.phaseMappingRepository.findByWorkflowCode(workflowCode);
    if (!mapping) {
      return [Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition];
    }
    return mapping.allowedPhases;
  }

  isValidPhaseTransition(from: Phase, to: Phase): boolean {
    const order = [Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition];
    return order.indexOf(to) >= order.indexOf(from);
  }

  analyzePhaseRangeChange(
    workflow: WorkflowDefinition & { nodes: FlowTemplateNodeEntity[] },
    newPhases: Phase[]
  ): { affectedNodes: FlowTemplateNodeEntity[]; hasImpact: boolean } {
    const affected = workflow.nodes.filter((n) => !newPhases.includes(n.phase));
    return { affectedNodes: affected, hasImpact: affected.length > 0 };
  }

  async getPhaseIntersection(workflowPhases: Phase[], docTypePhases: Phase[]): Promise<Phase[]> {
    return workflowPhases.filter((p) => docTypePhases.includes(p));
  }

  async suggestPhaseForNode(
    workflow: WorkflowDefinition,
    docTypePhases: Phase[]
  ): Promise<{ phase: Phase | null; hasIntersection: boolean; suggestions: Phase[] }> {
    const intersection = await this.getPhaseIntersection(workflow.phases, docTypePhases);
    if (intersection.length === 0) {
      return { phase: null, hasIntersection: false, suggestions: workflow.phases };
    }
    const phase = intersection.includes(Phase.Inception) ? Phase.Inception : intersection[0];
    return { phase, hasIntersection: true, suggestions: intersection };
  }
}