import { describe, it, expect } from 'vitest';
import { ValidationReport } from '../../../domain/value-objects/validation-report';
import { ValidationIssueEntity } from '../../../domain/entities/validation-issue.entity';

describe('ValidationReport - additional coverage', () => {
  it('getErrorsByType and hasErrorType work', () => {
    const e1 = {
      ...ValidationIssueEntity.createWorkflowEmpty('t', 'w', 'W'),
      type: 'workflow_empty'
    } as any;
    const e2 = {
      ...ValidationIssueEntity.createWorkflowEmpty('t', 'w', 'W'),
      type: 'missing_doctype'
    } as any;

    const report = ValidationReport.createInvalid('t', [e1, e2], []);
    expect(report.getErrorsByType('workflow_empty').length).toBe(1);
    expect(report.hasErrorType('missing_doctype')).toBe(true);
  });

  it('getSummary returns different text for valid/invalid', () => {
    const valid = ValidationReport.createValid('t');
    expect(valid.getSummary()).toBe('Template validation passed');

    const invalid = ValidationReport.createInvalid('t', [ValidationIssueEntity.createWorkflowEmpty('t', 'w', 'W')], []);
    expect(invalid.getSummary()).toContain('Template validation failed');
  });

  it('toJSON serializes fields', () => {
    const rpt = ValidationReport.createInvalid('t', [ValidationIssueEntity.createWorkflowEmpty('t', 'w', 'W')], []);
    const j = rpt.toJSON();
    expect(j.templateId).toBe('t');
    expect(j.errorCount).toBe(1);
    expect(j.warningCount).toBe(0);
    expect(typeof j.summary).toBe('string');
    expect(typeof j.createdAt).toBe('string');
  });
});