import { describe, it, expect } from 'vitest';
import {
  InputDocumentRefSchema,
  isInputDocumentRef,
  createInputDocumentRef,
} from '../../types/value-objects/input-document-ref';

describe('InputDocumentRef Value Object', () => {
  const validDocId = '550e8400-e29b-41d4-a716-446655440000';

  describe('Schema Validation', () => {
    it('should validate valid input document ref', () => {
      const ref = {
        documentId: validDocId,
        documentName: 'Vision Document',
        version: 'v1',
        content: 'Document content here',
        role: 'source',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(true);
    });

    it('should validate without role field', () => {
      const ref = {
        documentId: validDocId,
        documentName: 'Vision Document',
        version: 'v2',
        content: 'Content',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(true);
    });

    it('should validate rollback version', () => {
      const ref = {
        documentId: validDocId,
        documentName: 'Test',
        version: 'b-v3',
        content: 'Content',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const ref = {
        documentId: validDocId,
        documentName: 'Test',
        version: 'version-1',
        content: 'Content',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const ref = {
        documentId: 'not-a-uuid',
        documentName: 'Test',
        version: 'v1',
        content: 'Content',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(false);
    });

    it('should reject empty document name', () => {
      const ref = {
        documentId: validDocId,
        documentName: '',
        version: 'v1',
        content: 'Content',
      };
      const result = InputDocumentRefSchema.safeParse(ref);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid input document ref', () => {
      const ref = createInputDocumentRef(validDocId, 'Test', 'v1', 'Content');
      expect(isInputDocumentRef(ref)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isInputDocumentRef(null)).toBe(false);
      expect(isInputDocumentRef({})).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create valid input document ref with role', () => {
      const ref = createInputDocumentRef(validDocId, 'Vision Doc', 'v1', 'Content here', 'upstream');
      expect(ref.documentId).toBe(validDocId);
      expect(ref.documentName).toBe('Vision Doc');
      expect(ref.version).toBe('v1');
      expect(ref.content).toBe('Content here');
      expect(ref.role).toBe('upstream');
    });

    it('should create valid input document ref without role', () => {
      const ref = createInputDocumentRef(validDocId, 'Vision Doc', 'v1', 'Content');
      expect(ref.role).toBeUndefined();
    });

    it('should throw error for invalid version', () => {
      expect(() => createInputDocumentRef(validDocId, 'Test', 'invalid', 'Content')).toThrow(
        'Invalid InputDocumentRef'
      );
    });

    it('should throw error for invalid UUID', () => {
      expect(() => createInputDocumentRef('not-uuid', 'Test', 'v1', 'Content')).toThrow('Invalid InputDocumentRef');
    });
  });
});