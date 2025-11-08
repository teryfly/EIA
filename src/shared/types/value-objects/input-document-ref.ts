/**
 * @fileoverview InputDocumentRef value object
 * Represents a reference to an input document used in AI draft generation
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * InputDocumentRef interface
 */
export interface InputDocumentRef {
  documentId: string;
  documentName: string;
  version: string;
  content: string;
  role?: string;
}

// ============================================================================
// Zod Schema
// ============================================================================

/**
 * Version format: v1, v2, b-v1, b-v2
 */
const VERSION_REGEX = /^(b-)?v\d+$/;

/**
 * Schema for InputDocumentRef
 */
export const InputDocumentRefSchema = z.object({
  documentId: z.string().uuid(),
  documentName: z.string().min(1),
  version: z.string().regex(VERSION_REGEX, 'Version must match format: v1, v2, b-v1, b-v2'),
  content: z.string(),
  role: z.string().optional(),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for InputDocumentRef
 */
export function isInputDocumentRef(value: unknown): value is InputDocumentRef {
  const result = InputDocumentRefSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create an InputDocumentRef
 */
export function createInputDocumentRef(
  documentId: string,
  documentName: string,
  version: string,
  content: string,
  role?: string
): InputDocumentRef {
  const result = InputDocumentRefSchema.safeParse({
    documentId,
    documentName,
    version,
    content,
    role,
  });

  if (!result.success) {
    throw new Error(`Invalid InputDocumentRef: ${result.error.message}`);
  }

  return result.data;
}