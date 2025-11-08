import { describe, it, expect } from 'vitest';
import {
  TriggerSourceSchema,
  isTriggerSource,
  createTriggerSource,
  isRollbackVersion,
  getVersionNumber,
  createRollbackVersion,
} from '../../types/value-objects/trigger-source';

describe('TriggerSource Value Object', () => {
  const validDocId = '550e8400-e29b-41d4-a716-446655440000';

  describe('Schema Validation', () => {
    it('should validate valid trigger source', () => {
      const source = {
        documentId: validDocId,
        documentName: 'Vision Document',
        version: 'v1',
        summary: 'Initial version',
      };
      const result = TriggerSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it('should validate rollback version format', () => {
      const source = {
        documentId: validDocId,
        documentName: 'Vision Document',
        version: 'b-v2',
        summary: 'Rollback to version 2',
      };
      const result = TriggerSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const source = {
        documentId: validDocId,
        documentName: 'Vision Document',
        version: 'version-1',
        summary: 'Invalid version',
      };
      const result = TriggerSourceSchema.safeParse(source);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const source = {
        documentId: 'not-a-uuid',
        documentName: 'Vision Document',
        version: 'v1',
        summary: 'Test',
      };
      const result = TriggerSourceSchema.safeParse(source);
      expect(result.success).toBe(false);
    });

    it('should reject empty document name', () => {
      const source = {
        documentId: validDocId,
        documentName: '',
        version: 'v1',
        summary: 'Test',
      };
      const result = TriggerSourceSchema.safeParse(source);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid trigger source', () => {
      const source = createTriggerSource(validDocId, 'Test Doc', 'v1', 'Summary');
      expect(isTriggerSource(source)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isTriggerSource(null)).toBe(false);
      expect(isTriggerSource({})).toBe(false);
      expect(isTriggerSource({ version: 'invalid' })).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create valid trigger source', () => {
      const source = createTriggerSource(validDocId, 'Vision Document', 'v1', 'Initial draft');
      expect(source.documentId).toBe(validDocId);
      expect(source.documentName).toBe('Vision Document');
      expect(source.version).toBe('v1');
      expect(source.summary).toBe('Initial draft');
    });

    it('should throw error for invalid version format', () => {
      expect(() => createTriggerSource(validDocId, 'Test', 'version1', 'Summary')).toThrow('Invalid TriggerSource');
    });

    it('should throw error for invalid UUID', () => {
      expect(() => createTriggerSource('not-uuid', 'Test', 'v1', 'Summary')).toThrow('Invalid TriggerSource');
    });
  });

  describe('Helper Functions', () => {
    describe('isRollbackVersion', () => {
      it('should return true for rollback versions', () => {
        expect(isRollbackVersion('b-v1')).toBe(true);
        expect(isRollbackVersion('b-v10')).toBe(true);
      });

      it('should return false for normal versions', () => {
        expect(isRollbackVersion('v1')).toBe(false);
        expect(isRollbackVersion('v10')).toBe(false);
      });
    });

    describe('getVersionNumber', () => {
      it('should extract version number from normal version', () => {
        expect(getVersionNumber('v1')).toBe(1);
        expect(getVersionNumber('v10')).toBe(10);
        expect(getVersionNumber('v123')).toBe(123);
      });

      it('should extract version number from rollback version', () => {
        expect(getVersionNumber('b-v1')).toBe(1);
        expect(getVersionNumber('b-v10')).toBe(10);
      });

      it('should return 0 for invalid format', () => {
        expect(getVersionNumber('invalid')).toBe(0);
        expect(getVersionNumber('version-1')).toBe(0);
      });
    });

    describe('createRollbackVersion', () => {
      it('should create rollback version from normal version', () => {
        expect(createRollbackVersion('v1')).toBe('b-v1');
        expect(createRollbackVersion('v10')).toBe('b-v10');
      });

      it('should return same version if already rollback', () => {
        expect(createRollbackVersion('b-v1')).toBe('b-v1');
        expect(createRollbackVersion('b-v10')).toBe('b-v10');
      });
    });
  });
});