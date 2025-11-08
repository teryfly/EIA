/**
 * @fileoverview CompletionCondition value object
 * Defines node completion strategies and validation
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Base interface for all completion conditions
 */
export interface CompletionConditionBase {
  type: string;
}

/**
 * Manual confirmation completion condition
 */
export interface ManualConfirmCondition extends CompletionConditionBase {
  type: 'ManualConfirmCondition';
}

/**
 * Minimum documents completion condition
 */
export interface MinDocumentsCondition extends CompletionConditionBase {
  type: 'MinDocumentsCondition';
  minDocuments: number;
}

/**
 * Checklist item for checklist condition
 */
export interface ChecklistItem {
  text: string;
  docTypeBinding?: string;
  sequence: number;
  required: boolean;
}

/**
 * Checklist completion condition
 */
export interface ChecklistCondition extends CompletionConditionBase {
  type: 'ChecklistCondition';
  items: ChecklistItem[];
}

/**
 * Discriminated union of all completion condition types
 */
export type CompletionCondition = ManualConfirmCondition | MinDocumentsCondition | ChecklistCondition;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for ManualConfirmCondition
 */
export const ManualConfirmConditionSchema = z.object({
  type: z.literal('ManualConfirmCondition'),
});

/**
 * Schema for MinDocumentsCondition
 */
export const MinDocumentsConditionSchema = z.object({
  type: z.literal('MinDocumentsCondition'),
  minDocuments: z.number().int().positive(),
});

/**
 * Schema for ChecklistItem
 */
export const ChecklistItemSchema = z.object({
  text: z.string().min(1),
  docTypeBinding: z.string().optional(),
  sequence: z.number().int().nonnegative(),
  required: z.boolean(),
});

/**
 * Schema for ChecklistCondition
 */
export const ChecklistConditionSchema = z.object({
  type: z.literal('ChecklistCondition'),
  items: z.array(ChecklistItemSchema).min(1),
});

/**
 * Schema for CompletionCondition discriminated union
 */
export const CompletionConditionSchema = z.discriminatedUnion('type', [
  ManualConfirmConditionSchema,
  MinDocumentsConditionSchema,
  ChecklistConditionSchema,
]);

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for CompletionCondition
 */
export function isCompletionCondition(value: unknown): value is CompletionCondition {
  const result = CompletionConditionSchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for ManualConfirmCondition
 */
export function isManualConfirmCondition(value: CompletionCondition): value is ManualConfirmCondition {
  return value.type === 'ManualConfirmCondition';
}

/**
 * Type guard for MinDocumentsCondition
 */
export function isMinDocumentsCondition(value: CompletionCondition): value is MinDocumentsCondition {
  return value.type === 'MinDocumentsCondition';
}

/**
 * Type guard for ChecklistCondition
 */
export function isChecklistCondition(value: CompletionCondition): value is ChecklistCondition {
  return value.type === 'ChecklistCondition';
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a ManualConfirmCondition
 */
export function createManualConfirmCondition(): ManualConfirmCondition {
  return {
    type: 'ManualConfirmCondition',
  };
}

/**
 * Create a MinDocumentsCondition
 */
export function createMinDocumentsCondition(minDocuments: number): MinDocumentsCondition {
  if (minDocuments <= 0) {
    throw new Error('minDocuments must be positive');
  }
  return {
    type: 'MinDocumentsCondition',
    minDocuments,
  };
}

/**
 * Create a ChecklistCondition
 */
export function createChecklistCondition(items: ChecklistItem[]): ChecklistCondition {
  if (items.length === 0) {
    throw new Error('ChecklistCondition must have at least one item');
  }
  return {
    type: 'ChecklistCondition',
    items,
  };
}

/**
 * Create a ChecklistItem
 */
export function createChecklistItem(
  text: string,
  sequence: number,
  required: boolean,
  docTypeBinding?: string
): ChecklistItem {
  if (text.trim().length === 0) {
    throw new Error('ChecklistItem text cannot be empty');
  }
  if (sequence < 0) {
    throw new Error('ChecklistItem sequence must be non-negative');
  }
  return {
    text,
    docTypeBinding,
    sequence,
    required,
  };
}