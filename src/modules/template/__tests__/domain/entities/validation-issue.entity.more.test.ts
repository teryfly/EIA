import { describe, it, expect } from 'vitest';
import { ValidationIssueEntity } from '../../../domain/entities/validation-issue.entity';
import { Phase } from '@/shared/types/enums';

describe('ValidationIssueEntity - additional branches', () => {
  it('createMissingDocType and toPrisma/toJSON, resolve guard', () => {
    const issue = ValidationIssueEntity.createMissingDocType('tpl', 'wf', 'node', 'DocX');
    const p = issue.toPrisma() as any;
    expect(p.templateId).toBe('tpl');
    expect(p.workflowId).toBe('wf');
    expect(p.nodeId).toBe('node');
    expect(p.details.docTypeId).toBe('DocX');
    const j = issue.toJSON();
    expect(typeof j.createdAt).toBe('string');
    expect(j.resolvedAt).toBeNull();

    // resolve then resolving again should throw
    issue.resolve();
    expect(issue.isResolved()).toBe(true);
    expect(() => issue.resolve()).toThrow('Issue is already resolved');
  });

  it('createPhaseInvalid and createOrphanedNode variations', () => {
    const pi = ValidationIssueEntity.createPhaseInvalid('t', 'w', 'n', {
      nodePhase: Phase.Construction,
      allowedPhases: [Phase.Inception],
      nodeName: 'NodeA',
      workflowName: 'Req'
    });
    expect(pi.message).toContain('Node "NodeA"');
    const orphan = ValidationIssueEntity.createOrphanedNode('t', 'w', 'n', 'NodeB');
    expect(orphan.message).toContain('isolated');
  });

  it('fromPrisma maps nullable workflowId/nodeId/resolvedAt properly', () => {
    const now = new Date();
    const prim = {
      id: 'i1',
      templateId: 't',
      workflowId: null,
      nodeId: null,
      severity: 'warning',
      type: 'workflow_empty',
      message: 'm',
      details: { a: 1 },
      createdAt: now,
      resolvedAt: null
    } as any;
    const e = ValidationIssueEntity.fromPrisma(prim);
    expect(e.isWarning()).toBe(true);
    expect(e.workflowId).toBeNull();
    expect(e.nodeId).toBeNull();
  });
});