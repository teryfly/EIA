import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhaseValidationService } from '../../../domain/services/phase-validation.service';
import { PhaseMappingRepository } from '../../../repositories/phase-mapping.repository';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../../../domain/entities/flow-template-node.entity';
import { PhaseMappingEntity } from '../../../domain/entities/phase-mapping.entity';
import { Phase } from '@/shared/types/enums';

describe('PhaseValidationService', () => {
  let svc: PhaseValidationService;
  let mappingRepo: { findByWorkflowCode: any };

  beforeEach(() => {
    mappingRepo = { findByWorkflowCode: vi.fn() } as unknown as PhaseMappingRepository;
    svc = new PhaseValidationService(mappingRepo as any);
  });

  it('validateNodePhase returns null for valid', async () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 't',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration],
    });
    const n = FlowTemplateNodeEntity.create({
      workflowDefinitionId: w.id,
      nodeId: 'n1',
      docTypeId: 'd1',
      label: 'Vision',
      phase: Phase.Inception,
      workflow: 'Requirements',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any,
    });
    const issue = await svc.validateNodePhase('t', w, n);
    expect(issue).toBeNull();
  });

  it('validateNodePhase returns issue for invalid', async () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 't',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration],
    });
    const n = FlowTemplateNodeEntity.create({
      workflowDefinitionId: w.id,
      nodeId: 'n1',
      docTypeId: 'd1',
      label: 'Vision',
      phase: Phase.Construction,
      workflow: 'Requirements',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any,
    });
    const issue = await svc.validateNodePhase('t', w, n);
    expect(issue).not.toBeNull();
    expect(issue?.type).toBe('phase_invalid');
  });

  it('validateWorkflowPhases warns on non-standard', async () => {
    const mapping = new (PhaseMappingEntity as any)('m1', 'Requirements', [Phase.Inception, Phase.Elaboration], null, new Date(), new Date());
    (mappingRepo.findByWorkflowCode as any).mockResolvedValue(mapping);

    const w = WorkflowDefinition.create({
      rupTemplateId: 't',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Construction],
    });

    const res = await svc.validateWorkflowPhases(w);
    expect(res.valid).toBe(true);
    expect(res.warnings.length).toBe(1);
  });
});