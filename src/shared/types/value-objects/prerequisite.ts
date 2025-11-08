/**
 * @fileoverview Prerequisite value object
 * Represents node dependencies and prerequisite checking
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Prerequisite type enum (string literal type)
 */
export type PrerequisiteType = 'required' | 'optional';

/**
 * Prerequisite interface
 */
export interface Prerequisite {
  prerequisiteNodeInstanceId: string;
  fullTemplateNodeId: string;
  satisfied: boolean;
  type: PrerequisiteType;
}

// ============================================================================
// Zod Schema
// ============================================================================

/**
 * Schema for Prerequisite
 */
export const PrerequisiteSchema = z.object({
  prerequisiteNodeInstanceId: z.string().uuid(),
  fullTemplateNodeId: z.string().min(1),
  satisfied: z.boolean(),
  type: z.enum(['required', 'optional']),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for Prerequisite
 */
export function isPrerequisite(value: unknown): value is Prerequisite {
  const result = PrerequisiteSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if all required prerequisites are satisfied
 */
export function areAllRequiredPrerequisitesSatisfied(prerequisites: Prerequisite[]): boolean {
  return prerequisites
    .filter((p) => p.type === 'required')
    .every((p) => p.satisfied);
}

/**
 * Get unsatisfied required prerequisites
 */
export function getUnsatisfiedRequiredPrerequisites(prerequisites: Prerequisite[]): Prerequisite[] {
  return prerequisites.filter((p) => p.type === 'required' && !p.satisfied);
}

/**
 * Get optional prerequisites
 */
export function getOptionalPrerequisites(prerequisites: Prerequisite[]): Prerequisite[] {
  return prerequisites.filter((p) => p.type === 'optional');
}

/**
 * Get satisfied prerequisites
 */
export function getSatisfiedPrerequisites(prerequisites: Prerequisite[]): Prerequisite[] {
  return prerequisites.filter((p) => p.satisfied);
}

/**
 * Get prerequisite count statistics
 */
export function getPrerequisiteCount(prerequisites: Prerequisite[]): {
  total: number;
  required: number;
  optional: number;
  satisfied: number;
  unsatisfied: number;
} {
  const required = prerequisites.filter((p) => p.type === 'required');
  const optional = prerequisites.filter((p) => p.type === 'optional');
  const satisfied = prerequisites.filter((p) => p.satisfied);

  return {
    total: prerequisites.length,
    required: required.length,
    optional: optional.length,
    satisfied: satisfied.length,
    unsatisfied: prerequisites.length - satisfied.length,
  };
}