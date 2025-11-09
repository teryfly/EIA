import { describe, it, expect } from 'vitest';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { Phase } from '@/shared/types/enums';

describe('WorkflowDefinition - additional coverage', () => {
  it('validateName via update throws for empty and too short/long', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'Good',
      code: 'Code',
      phases: [Phase.Inception]
    });
    expect(() => w.update({ name: '' as any })).toThrow('Workflow name cannot be empty');
    expect(() => w.update({ name: 'A' })).toThrow('Workflow name must be between 2 and 100 characters');
    const long = 'x'.repeat(101);
    expect(() => w.update({ name: long })).toThrow('Workflow name must be between 2 and 100 characters');
  });

  it('validatePhases throws for duplicate and invalid value', () => {
    expect(() => WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'BadDup',
      code: 'Dup',
      phases: [Phase.Inception, Phase.Inception]
    })).toThrow('Workflow phases must be unique');
    // @ts-expect-error intentional invalid value
    expect(() => WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'BadInvalid',
      code: 'Bad',
      // @ts-ignore
      phases: ['NotAPhase']
    })).toThrow('Invalid phase: NotAPhase');
  });

  it('priority must be non-negative on update', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'Valid Name',
      code: 'W',
      phases: [Phase.Inception]
    });
    expect(() => w.update({ priority: -1 })).toThrow('Priority must be non-negative');
  });

  it('hasNodes placeholder returns true and events can be cleared', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'Wf',
      code: 'W',
      phases: [Phase.Inception]
    });
    expect(w.hasNodes()).toBe(true);
    expect(w.getDomainEvents().length).toBeGreaterThan(0);
    w.clearDomainEvents();
    expect(w.getDomainEvents().length).toBe(0);
  });

  it('toPrisma returns serializable fields', () => {
    const w = WorkflowDefinition.create({
      rupTemplateId: 'tpl',
      name: 'Wf',
      code: 'W',
      priority: 3,
      estimatedDuration: '2m',
      description: 'desc',
      phases: [Phase.Inception, Phase.Elaboration]
    });
    const obj = w.toPrisma() as any;
    expect(obj.id).toBe(w.id);
    expect(obj.rupTemplateId).toBe('tpl');
    expect(obj.phases).toEqual([Phase.Inception, Phase.Elaboration]);
    expect(obj.createdAt).toBeInstanceOf(Date);
    expect(obj.updatedAt).toBeInstanceOf(Date);
  });
});