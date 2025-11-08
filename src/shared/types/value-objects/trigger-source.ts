/**
 * @fileoverview TriggerSource value object
 * Represents the source document that triggered an alert or regeneration
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * TriggerSource interface
 */
export interface TriggerSource {
  documentId: string;
  documentName: string;
  version: string;
  summary: string;
}

// ============================================================================
// Zod Schema
// ============================================================================

/**
 * Version format: v1, v2, b-v1, b-v2 (b- prefix for rollback versions)
 */
const VERSION_REGEX = /^(b-)?v\d+$/;

/**
 * Schema for TriggerSource
 */
export const TriggerSourceSchema = z.object({
  documentId: z.string().uuid(),
  documentName: z.string().min(1),
  version: z.string().regex(VERSION_REGEX, 'Version must match format: v1, v2, b-v1, b-v2'),
  summary: z.string(),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for TriggerSource
 */
export function isTriggerSource(value: unknown): value is TriggerSource {
  const result = TriggerSourceSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a TriggerSource
 */
export function createTriggerSource(
  documentId: string,
  documentName: string,
  version: string,
  summary: string
): TriggerSource {
  const result = TriggerSourceSchema.safeParse({
    documentId,
    documentName,
    version,
    summary,
  });

  if (!result.success) {
    throw new Error(`Invalid TriggerSource: ${result.error.message}`);
  }

  return result.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a version is a rollback version (has b- prefix)
 */
export function isRollbackVersion(version: string): boolean {
  return version.startsWith('b-');
}

/**
 * Extract version number from version string
 */
export function getVersionNumber(version: string): number {
  const match = version.match(/v(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Create rollback version string from normal version
 */
export function createRollbackVersion(version: string): string {
  if (isRollbackVersion(version)) {
    return version;
  }
  return `b-${version}`;
}