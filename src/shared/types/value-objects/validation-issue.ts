/**
 * @fileoverview ValidationIssue value object
 * Represents template validation errors and warnings
 */

import { z } from 'zod';
import { IssueSeverity, IssueType } from '../enums';
import { JSONValue } from '../common';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * ValidationIssue interface
 */
export interface ValidationIssue {
  templateId: string;
  workflowId?: string;
  nodeId?: string;
  severity: IssueSeverity;
  type: IssueType;
  message: string;
  details: JSONValue;
  resolvedAt?: Date;
}

// ============================================================================
// Zod Schema
// ============================================================================

/**
 * Schema for ValidationIssue
 */
export const ValidationIssueSchema = z.object({
  templateId: z.string().uuid(),
  workflowId: z.string().optional(),
  nodeId: z.string().optional(),
  severity: z.nativeEnum(IssueSeverity),
  type: z.nativeEnum(IssueType),
  message: z.string().min(1),
  details: z.any(), // JSONValue - any JSON-serializable object
  resolvedAt: z.date().optional(),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for ValidationIssue
 */
export function isValidationIssue(value: unknown): value is ValidationIssue {
  const result = ValidationIssueSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a validation issue is resolved
 */
export function isResolved(issue: ValidationIssue): boolean {
  return issue.resolvedAt !== undefined && issue.resolvedAt !== null;
}

/**
 * Check if issue is an error (blocking)
 */
export function isErrorIssue(issue: ValidationIssue): boolean {
  return issue.severity === IssueSeverity.error;
}

/**
 * Check if issue is a warning (non-blocking)
 */
export function isWarningIssue(issue: ValidationIssue): boolean {
  return issue.severity === IssueSeverity.warning;
}

/**
 * Check if issue is informational
 */
export function isInfoIssue(issue: ValidationIssue): boolean {
  return issue.severity === IssueSeverity.info;
}