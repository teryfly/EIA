import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhaseValidationService } from '../../../domain/services/phase-validation.service';
import { PhaseMappingRepository } from '../../../repositories/phase-mapping.repository';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { Phase } from '@/shared/types/enums';
import { PhaseMappingEntity } from '../../../domain/entities/phase-mapping.entity';
import { FlowTemplateNodeEntity } from '../../../domain/entities/flow-template-node.entity';

describe('PhaseValidationService - additional coverage', () => {
  let repo: any;
  let svc: PhaseValidationService;

  beforeEach(() => {
    repo = { findByWorkflowCode: vi.fn() } as unknown as PhaseMappingRepository;
    svc = new PhaseValidationService(repo as any);
  });

  it('getDefaultPhase returns Inception if in list, else first, else Inception when empty', () => {
    const w1 = WorkflowDefinition.create({ rupTemplateId: 't', name: 'AB', code: 'A', phases: [Phase.Elaboration, Phase.Inception] });
    expect(svc.getDefaultPhase(w1)).toBe(Phase.Inception);
    const w2 = WorkflowDefinition.create({ rupTemplateId: 't', name: 'BB', code: 'B', phases: [Phase.Construction, Phase.Transition] });
    expect(svc.getDefaultPhase(w2)).toBe(Phase.Construction);
    // simulate empty list via direct property set for edge case
    (w2 as any).phases = [];
    expect(svc.getDefaultPhase(w2)).toBe(Phase.Inception);
  });

  it('getAllowedPhasesForWorkflow returns mapping or fallback', async () => {
    const mapping = new (PhaseMappingEntity as any)('id', 'Req', [Phase.Inception, Phase.Elaboration], null, new Date(), new Date());
    (repo.findByWorkflowCode as any).mockResolvedValueOnce(mapping);
    const m1 = await svc.getAllowedPhasesForWorkflow('Req');
    expect(m1).toEqual([Phase.Inception, Phase.Elaboration]);

    (repo.findByWorkflowCode as any).mockResolvedValueOnce(null);
    const fallback = await svc.getAllowedPhasesForWorkflow('Unknown');
    expect(fallback).toEqual([Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition]);
  });

  it('isValidPhaseTransition respects order', () => {
    expect(svc.isValidPhaseTransition(Phase.Inception, Phase.Elaboration)).toBe(true);
    expect(svc.isValidPhaseTransition(Phase.Elaboration, Phase.Inception)).toBe(false);
    expect(svc.isValidPhaseTransition(Phase.Construction, Phase.Construction)).toBe(true);
  });

  it('analyzePhaseRangeChange finds affected nodes', () => {
    const w = WorkflowDefinition.create({ rupTemplateId: 't', name: 'WW', code: 'W', phases: [Phase.Inception, Phase.Elaboration] }) as any;
    // Provide nodes with real-like structure (phase field consulted)
    w.nodes = [
      { id: 'n1', phase: Phase.Inception, label: 'A' } as any,
      { id: 'n2', phase: Phase.Construction, label: 'B' } as any
    ];
    const res = svc.analyzePhaseRangeChange(w, [Phase.Inception]);
    expect(res.hasImpact).toBe(true);
    expect(res.affectedNodes.length).toBe(1);
    expect(res.affectedNodes[0].id).toBe('n2');
  });

  it('getPhaseIntersection and suggestPhaseForNode - no intersection path', async () => {
    const w = WorkflowDefinition.create({ rupTemplateId: 't', name: 'WX', code: 'W', phases: [Phase.Inception, Phase.Elaboration] });
    const inter = await svc.getPhaseIntersection([Phase.Inception, Phase.Elaboration], [Phase.Construction]);
    expect(inter).toEqual([]);
    const suggestion = await svc.suggestPhaseForNode(w, [Phase.Construction]);
    expect(suggestion.hasIntersection).toBe(false);
    expect(suggestion.phase).toBeNull();
    expect(suggestion.suggestions).toEqual([Phase.Inception, Phase.Elaboration]);
  });

  it('validateWorkflowPhases returns warnings when non-standard and none when mapping absent', async () => {
    // Absent mapping: no warnings
    (repo.findByWorkflowCode as any).mockResolvedValueOnce(null);
    const w1 = WorkflowDefinition.create({ rupTemplateId: 't', name: 'W1', code: 'W', phases: [Phase.Inception] });
    const res1 = await svc.validateWorkflowPhases(w1);
    expect(res1.valid).toBe(true);
    expect(res1.warnings.length).toBe(0);

    // With mapping and non-standard phase produces warning
    const mapping = new (PhaseMappingEntity as any)('id', 'W', [Phase.Inception, Phase.Elaboration], null, new Date(), new Date());
    (repo.findByWorkflowCode as any).mockResolvedValueOnce(mapping);
    const w2 = WorkflowDefinition.create({ rupTemplateId: 't', name: 'W2', code: 'W', phases: [Phase.Inception, Phase.Construction] });
    const res2 = await svc.validateWorkflowPhases(w2);
    expect(res2.valid).toBe(true);
    expect(res2.warnings.length).toBe(1);
  });

  it('validateNodePhase returns issue when node outside workflow phases', async () => {
    const w = WorkflowDefinition.create({ rupTemplateId: 't', name: 'WV', code: 'WV', phases: [Phase.Inception] });
    const node = FlowTemplateNodeEntity.create({
      workflowDefinitionId: w.id,
      nodeId: 'n1',
      docTypeId: 'd1',
      label: 'Vision',
      phase: Phase.Construction,
      workflow: 'WV',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any
    });
    const issue = await svc.validateNodePhase('t', w, node);
    expect(issue?.type).toBe('phase_invalid');
  });
});