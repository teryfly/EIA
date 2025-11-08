import { describe, it, expect } from 'vitest';
import { IssueSeverity, IssueType } from '../../types/enums';
import {
  ValidationIssueSchema,
  isValidationIssue,
  isResolved,
  isErrorIssue,
  isWarningIssue,
  isInfoIssue,
  type ValidationIssue,
} from '../../types/value-objects/validation-issue';

describe('ValidationIssue Value Object', () => {
  const validIssue: ValidationIssue = {
    templateId: '550e8400-e29b-41d4-a716-446655440000',
    workflowId: 'wf-requirements',
    nodeId: 'node-vision',
    severity: IssueSeverity.error,
    type: IssueType.phase_invalid,
    message: 'Phase is invalid for this workflow',
    details: {
      expectedPhases: ['Inception', 'Elaboration'],
      actualPhase: 'Construction',
    },
  };

  describe('Schema Validation', () => {
    it('should validate valid issue', () => {
      const result = ValidationIssueSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should validate issue with resolvedAt', () => {
      const resolved = { ...validIssue, resolvedAt: new Date() };
      const result = ValidationIssueSchema.safeParse(resolved);
      expect(result.success).toBe(true);
    });

    it('should validate issue without optional fields', () => {
      const minimal = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        severity: IssueSeverity.warning,
        type: IssueType.orphaned_node,
        message: 'Node has no connections',
        details: {},
      };
      const result = ValidationIssueSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('should reject invalid template ID', () => {
      const invalid = { ...validIssue, templateId: 'not-a-uuid' };
      const result = ValidationIssueSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid severity', () => {
      const invalid = { ...validIssue, severity: 'critical' };
      const result = ValidationIssueSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid issue type', () => {
      const invalid = { ...validIssue, type: 'unknown_type' };
      const result = ValidationIssueSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty message', () => {
      const invalid = { ...validIssue, message: '' };
      const result = ValidationIssueSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid issue', () => {
      expect(isValidationIssue(validIssue)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isValidationIssue(null)).toBe(false);
      expect(isValidationIssue({})).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    describe('isResolved', () => {
      it('should return true when issue is resolved', () => {
        const resolved = { ...validIssue, resolvedAt: new Date() };
        expect(isResolved(resolved)).toBe(true);
      });

      it('should return false when issue is not resolved', () => {
        expect(isResolved(validIssue)).toBe(false);
      });

      it('should return false for null resolvedAt', () => {
        const issue = { ...validIssue, resolvedAt: null as any };
        expect(isResolved(issue)).toBe(false);
      });
    });

    describe('isErrorIssue', () => {
      it('should return true for error severity', () => {
        const error = { ...validIssue, severity: IssueSeverity.error };
        expect(isErrorIssue(error)).toBe(true);
      });

      it('should return false for non-error severity', () => {
        const warning = { ...validIssue, severity: IssueSeverity.warning };
        expect(isErrorIssue(warning)).toBe(false);
      });
    });

    describe('isWarningIssue', () => {
      it('should return true for warning severity', () => {
        const warning = { ...validIssue, severity: IssueSeverity.warning };
        expect(isWarningIssue(warning)).toBe(true);
      });

      it('should return false for non-warning severity', () => {
        const error = { ...validIssue, severity: IssueSeverity.error };
        expect(isWarningIssue(error)).toBe(false);
      });
    });

    describe('isInfoIssue', () => {
      it('should return true for info severity', () => {
        const info = { ...validIssue, severity: IssueSeverity.info };
        expect(isInfoIssue(info)).toBe(true);
      });

      it('should return false for non-info severity', () => {
        const error = { ...validIssue, severity: IssueSeverity.error };
        expect(isInfoIssue(error)).toBe(false);
      });
    });
  });
});