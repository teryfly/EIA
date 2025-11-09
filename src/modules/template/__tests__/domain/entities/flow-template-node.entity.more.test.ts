import { describe, it, expect } from 'vitest';
import { FlowTemplateNodeEntity } from '../../../domain/entities/flow-template-node.entity';
import { Phase } from '@/shared/types/enums';

describe('FlowTemplateNodeEntity - additional coverage', () => {
  const base = () => ({
    workflowDefinitionId: 'wf1',
    nodeId: 'n1',
    docTypeId: 'doc1',
    label: 'Label',
    description: 'desc',
    phase: Phase.Inception,
    workflow: 'WF',
    priority: 1,
    estimatedDuration: '1m',
    positionX: 10,
    positionY: 20,
    completionCondition: { type: 'ManualConfirmCondition' } as any
  });

  it('create composes fullId and validates label', () => {
    const n = FlowTemplateNodeEntity.create(base());
    expect(n.fullId).toBe('wf1.n1');
    expect(n.label).toBe('Label');
    expect(() => FlowTemplateNodeEntity.create({ ...base(), label: ' ' })).toThrow('Node label cannot be empty');
  });

  it('fromPrisma and toPrisma round-trip essentials', () => {
    const n = FlowTemplateNodeEntity.create(base());
    const prisma = n.toPrisma() as any;
    expect(prisma.id).toBe(n.id);
    expect(prisma.workflowDefinitionId).toBe('wf1');
    expect(prisma.fullId).toBe('wf1.n1');
    expect(prisma.positionX).toBe(10);
    expect(prisma.positionY).toBe(20);
    expect(prisma.completionCondition).toBeTypeOf('object');

    const re = FlowTemplateNodeEntity.fromPrisma({
      ...prisma,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt
    } as any);
    expect(re.id).toBe(n.id);
    expect(re.fullId).toBe(n.fullId);
    expect(re.label).toBe(n.label);
  });

  it('update validates fields and timestamps', () => {
    const n = FlowTemplateNodeEntity.create(base());
    const prev = n.updatedAt.getTime();
    n.update({
      label: 'New',
      description: 'd2',
      phase: Phase.Elaboration,
      priority: 2,
      estimatedDuration: '2m',
      positionX: 30,
      positionY: 40,
      completionCondition: { type: 'ChecklistCondition', items: [{ text: 't', sequence: 0, required: true }] } as any
    });
    expect(n.label).toBe('New');
    expect(n.description).toBe('d2');
    expect(n.phase).toBe(Phase.Elaboration);
    expect(n.priority).toBe(2);
    expect(n.estimatedDuration).toBe('2m');
    expect(n.positionX).toBe(30);
    expect(n.positionY).toBe(40);
    expect(n.updatedAt.getTime()).toBeGreaterThanOrEqual(prev);
  });

  it('update throws for invalid label and negative priority', () => {
    const n = FlowTemplateNodeEntity.create(base());
    expect(() => n.update({ label: '' as any })).toThrow('Node label cannot be empty');
    expect(() => n.update({ priority: -5 })).toThrow('Priority must be non-negative');
  });

  it('domain events accumulate and can be cleared', () => {
    const n = FlowTemplateNodeEntity.create(base());
    const events1 = n.getDomainEvents();
    expect(events1.length).toBeGreaterThan(0);
    n.update({ label: 'B' });
    const events2 = n.getDomainEvents();
    expect(events2.length).toBeGreaterThan(events1.length);
    n.clearDomainEvents();
    expect(n.getDomainEvents().length).toBe(0);
  });
});