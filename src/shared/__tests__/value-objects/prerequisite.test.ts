import { describe, it, expect } from 'vitest';
import {
  PrerequisiteSchema,
  isPrerequisite,
  areAllRequiredPrerequisitesSatisfied,
  getUnsatisfiedRequiredPrerequisites,
  getOptionalPrerequisites,
  getSatisfiedPrerequisites,
  getPrerequisiteCount,
  type Prerequisite,
} from '../../types/value-objects/prerequisite';

describe('Prerequisite Value Object', () => {
  const validPrerequisite: Prerequisite = {
    prerequisiteNodeInstanceId: '550e8400-e29b-41d4-a716-446655440000',
    fullTemplateNodeId: 'wf-requirements.node-vision',
    satisfied: true,
    type: 'required', // Use string literal instead of enum
  };

  describe('Schema Validation', () => {
    it('should validate valid prerequisite', () => {
      const result = PrerequisiteSchema.safeParse(validPrerequisite);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalid = { ...validPrerequisite, prerequisiteNodeInstanceId: 'not-a-uuid' };
      const result = PrerequisiteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty fullTemplateNodeId', () => {
      const invalid = { ...validPrerequisite, fullTemplateNodeId: '' };
      const result = PrerequisiteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalid = { ...validPrerequisite, type: 'invalid' };
      const result = PrerequisiteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid prerequisite', () => {
      expect(isPrerequisite(validPrerequisite)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isPrerequisite(null)).toBe(false);
      expect(isPrerequisite({})).toBe(false);
      expect(isPrerequisite({ ...validPrerequisite, type: 'invalid' })).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    const prerequisites: Prerequisite[] = [
      {
        prerequisiteNodeInstanceId: '550e8400-e29b-41d4-a716-446655440001',
        fullTemplateNodeId: 'wf-req.node-1',
        satisfied: true,
        type: 'required',
      },
      {
        prerequisiteNodeInstanceId: '550e8400-e29b-41d4-a716-446655440002',
        fullTemplateNodeId: 'wf-req.node-2',
        satisfied: false,
        type: 'required',
      },
      {
        prerequisiteNodeInstanceId: '550e8400-e29b-41d4-a716-446655440003',
        fullTemplateNodeId: 'wf-req.node-3',
        satisfied: true,
        type: 'optional',
      },
      {
        prerequisiteNodeInstanceId: '550e8400-e29b-41d4-a716-446655440004',
        fullTemplateNodeId: 'wf-req.node-4',
        satisfied: false,
        type: 'optional',
      },
    ];

    describe('areAllRequiredPrerequisitesSatisfied', () => {
      it('should return false when some required prerequisites are unsatisfied', () => {
        expect(areAllRequiredPrerequisitesSatisfied(prerequisites)).toBe(false);
      });

      it('should return true when all required prerequisites are satisfied', () => {
        const allSatisfied = prerequisites.map((p) => ({ ...p, satisfied: true }));
        expect(areAllRequiredPrerequisitesSatisfied(allSatisfied)).toBe(true);
      });

      it('should return true for empty array', () => {
        expect(areAllRequiredPrerequisitesSatisfied([])).toBe(true);
      });

      it('should ignore optional prerequisites', () => {
        const onlyOptional = prerequisites.filter((p) => p.type === 'optional');
        expect(areAllRequiredPrerequisitesSatisfied(onlyOptional)).toBe(true);
      });
    });

    describe('getUnsatisfiedRequiredPrerequisites', () => {
      it('should return only unsatisfied required prerequisites', () => {
        const result = getUnsatisfiedRequiredPrerequisites(prerequisites);
        expect(result).toHaveLength(1);
        expect(result[0].fullTemplateNodeId).toBe('wf-req.node-2');
        expect(result[0].type).toBe('required');
        expect(result[0].satisfied).toBe(false);
      });

      it('should return empty array when all required are satisfied', () => {
        const allSatisfied = prerequisites.map((p) => ({ ...p, satisfied: true }));
        expect(getUnsatisfiedRequiredPrerequisites(allSatisfied)).toHaveLength(0);
      });

      it('should return empty array for empty input', () => {
        expect(getUnsatisfiedRequiredPrerequisites([])).toHaveLength(0);
      });
    });

    describe('getOptionalPrerequisites', () => {
      it('should return only optional prerequisites', () => {
        const result = getOptionalPrerequisites(prerequisites);
        expect(result).toHaveLength(2);
        expect(result.every((p) => p.type === 'optional')).toBe(true);
      });

      it('should return empty array when no optional prerequisites', () => {
        const onlyRequired = prerequisites.filter((p) => p.type === 'required');
        expect(getOptionalPrerequisites(onlyRequired)).toHaveLength(0);
      });
    });

    describe('getSatisfiedPrerequisites', () => {
      it('should return only satisfied prerequisites', () => {
        const result = getSatisfiedPrerequisites(prerequisites);
        expect(result).toHaveLength(2);
        expect(result.every((p) => p.satisfied)).toBe(true);
      });

      it('should return empty array when none satisfied', () => {
        const noneSatisfied = prerequisites.map((p) => ({ ...p, satisfied: false }));
        expect(getSatisfiedPrerequisites(noneSatisfied)).toHaveLength(0);
      });
    });

    describe('getPrerequisiteCount', () => {
      it('should return correct counts', () => {
        const counts = getPrerequisiteCount(prerequisites);
        expect(counts.total).toBe(4);
        expect(counts.required).toBe(2);
        expect(counts.optional).toBe(2);
        expect(counts.satisfied).toBe(2);
        expect(counts.unsatisfied).toBe(2);
      });

      it('should handle empty array', () => {
        const counts = getPrerequisiteCount([]);
        expect(counts.total).toBe(0);
        expect(counts.required).toBe(0);
        expect(counts.optional).toBe(0);
        expect(counts.satisfied).toBe(0);
        expect(counts.unsatisfied).toBe(0);
      });
    });
  });
});