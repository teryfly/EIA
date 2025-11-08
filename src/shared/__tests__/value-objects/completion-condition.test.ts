import { describe, it, expect } from 'vitest';
import {
  CompletionConditionSchema,
  isCompletionCondition,
  isManualConfirmCondition,
  isMinDocumentsCondition,
  isChecklistCondition,
  createManualConfirmCondition,
  createMinDocumentsCondition,
  createChecklistCondition,
  createChecklistItem,
} from '../../types/value-objects/completion-condition';

describe('CompletionCondition Value Object', () => {
  describe('Schema Validation', () => {
    it('should validate ManualConfirmCondition', () => {
      const condition = { type: 'ManualConfirmCondition' };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should validate MinDocumentsCondition', () => {
      const condition = { type: 'MinDocumentsCondition', minDocuments: 2 };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should reject MinDocumentsCondition with invalid minDocuments', () => {
      const condition = { type: 'MinDocumentsCondition', minDocuments: 0 };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it('should validate ChecklistCondition', () => {
      const condition = {
        type: 'ChecklistCondition',
        items: [
          { text: 'Item 1', sequence: 0, required: true },
          { text: 'Item 2', sequence: 1, required: false, docTypeBinding: 'vision' },
        ],
      };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should reject ChecklistCondition with empty items', () => {
      const condition = { type: 'ChecklistCondition', items: [] };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it('should reject invalid condition type', () => {
      const condition = { type: 'InvalidType' };
      const result = CompletionConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify ManualConfirmCondition', () => {
      const condition = createManualConfirmCondition();
      expect(isCompletionCondition(condition)).toBe(true);
      expect(isManualConfirmCondition(condition)).toBe(true);
      expect(isMinDocumentsCondition(condition)).toBe(false);
      expect(isChecklistCondition(condition)).toBe(false);
    });

    it('should correctly identify MinDocumentsCondition', () => {
      const condition = createMinDocumentsCondition(3);
      expect(isCompletionCondition(condition)).toBe(true);
      expect(isManualConfirmCondition(condition)).toBe(false);
      expect(isMinDocumentsCondition(condition)).toBe(true);
      expect(isChecklistCondition(condition)).toBe(false);
    });

    it('should correctly identify ChecklistCondition', () => {
      const items = [createChecklistItem('Test', 0, true)];
      const condition = createChecklistCondition(items);
      expect(isCompletionCondition(condition)).toBe(true);
      expect(isManualConfirmCondition(condition)).toBe(false);
      expect(isMinDocumentsCondition(condition)).toBe(false);
      expect(isChecklistCondition(condition)).toBe(true);
    });

    it('should reject invalid objects', () => {
      expect(isCompletionCondition(null)).toBe(false);
      expect(isCompletionCondition({})).toBe(false);
      expect(isCompletionCondition({ type: 'Invalid' })).toBe(false);
    });
  });

  describe('Factory Functions', () => {
    describe('createManualConfirmCondition', () => {
      it('should create valid ManualConfirmCondition', () => {
        const condition = createManualConfirmCondition();
        expect(condition.type).toBe('ManualConfirmCondition');
      });
    });

    describe('createMinDocumentsCondition', () => {
      it('should create valid MinDocumentsCondition', () => {
        const condition = createMinDocumentsCondition(5);
        expect(condition.type).toBe('MinDocumentsCondition');
        expect(condition.minDocuments).toBe(5);
      });

      it('should throw error for non-positive minDocuments', () => {
        expect(() => createMinDocumentsCondition(0)).toThrow('minDocuments must be positive');
        expect(() => createMinDocumentsCondition(-1)).toThrow('minDocuments must be positive');
      });
    });

    describe('createChecklistCondition', () => {
      it('should create valid ChecklistCondition', () => {
        const items = [
          createChecklistItem('Item 1', 0, true),
          createChecklistItem('Item 2', 1, false, 'vision'),
        ];
        const condition = createChecklistCondition(items);
        expect(condition.type).toBe('ChecklistCondition');
        expect(condition.items).toHaveLength(2);
        expect(condition.items[0].text).toBe('Item 1');
        expect(condition.items[1].docTypeBinding).toBe('vision');
      });

      it('should throw error for empty items array', () => {
        expect(() => createChecklistCondition([])).toThrow('ChecklistCondition must have at least one item');
      });
    });

    describe('createChecklistItem', () => {
      it('should create valid ChecklistItem', () => {
        const item = createChecklistItem('Test item', 0, true, 'doc-type');
        expect(item.text).toBe('Test item');
        expect(item.sequence).toBe(0);
        expect(item.required).toBe(true);
        expect(item.docTypeBinding).toBe('doc-type');
      });

      it('should create ChecklistItem without docTypeBinding', () => {
        const item = createChecklistItem('Test item', 1, false);
        expect(item.text).toBe('Test item');
        expect(item.docTypeBinding).toBeUndefined();
      });

      it('should throw error for empty text', () => {
        expect(() => createChecklistItem('', 0, true)).toThrow('ChecklistItem text cannot be empty');
        expect(() => createChecklistItem('   ', 0, true)).toThrow('ChecklistItem text cannot be empty');
      });

      it('should throw error for negative sequence', () => {
        expect(() => createChecklistItem('Test', -1, true)).toThrow(
          'ChecklistItem sequence must be non-negative'
        );
      });
    });
  });
});