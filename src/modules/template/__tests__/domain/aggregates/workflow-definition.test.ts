import { describe, it, expect } from 'vitest';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { Phase } from '@/shared/types/enums';

describe('WorkflowDefinition', () => {
  it('create with phases and event', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Requirements',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration],
    });
    expect(w.phases).toEqual([Phase.Inception, Phase.Elaboration]);
    expect(w.getDomainEvents()[0].constructor.name).toBe('WorkflowAddedEvent');
  });

  it('update validates and stamps', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception],
    });
    w.update({ phases: [Phase.Inception, Phase.Elaboration], priority: 2, name: 'Req2' });
    expect(w.name).toBe('Req2');
    expect(w.priority).toBe(2);
    expect(w.phases.length).toBe(2);
  });

  it('phase allowed check', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception],
    });
    expect(w.isPhaseAllowed(Phase.Inception)).toBe(true);
    expect(w.isPhaseAllowed(Phase.Construction)).toBe(false);
  });

  it('throws for invalid phases', () => {
    expect(() =>
      WorkflowDefinition.create({
        rupTemplateId: 't1',
        name: 'X',
        code: 'X',
        phases: [],
      })
    ).toThrow('Workflow must have at least one phase');
  });
});