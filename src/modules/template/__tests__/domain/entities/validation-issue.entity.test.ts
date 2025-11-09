import { describe, it, expect } from 'vitest';
import { ValidationIssueEntity } from '../../../domain/entities/validation-issue.entity';
import { Phase } from '@/shared/types/enums';

describe('ValidationIssueEntity', () => {
  it('create phase invalid and resolve', () => {
    const issue = ValidationIssueEntity.createPhaseInvalid('tpl', 'wf', 'node', {
      nodePhase: Phase.Construction,
      allowedPhases: [Phase.Inception, Phase.Elaboration],
      nodeName: 'Node A',
      workflowName: 'Requirements',
    });
    expect(issue.isError()).toBe(true);
    expect(issue.isResolved()).toBe(false);
    issue.resolve();
    expect(issue.isResolved()).toBe(true);
  });

  it('create workflow empty warning', () => {
    const issue = ValidationIssueEntity.createWorkflowEmpty('tpl', 'wf', 'Req');
    expect(issue.isWarning()).toBe(true);
    expect(issue.message).toContain('no nodes');
  });
});