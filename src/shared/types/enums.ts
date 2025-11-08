/**
 * @fileoverview Enum definitions and type guards for the RUP AI system
 * Re-exports Prisma-generated enums and defines application-level enums
 * Provides type-safe runtime validation through type guard functions
 */

import {
  Phase,
  NodeStatus,
  DocumentStatus,
  AIDraftStatus,
  AlertStatus,
  EdgeType,
  TemplateCategory,
  TemplateStatus,
  AlertSource,
  UpstreamActionType,
  DraftGenType,
  TaskStatus,
  JobStatus,
  UserRole,
  ConfigDataType,
  IssueSeverity,
  IssueType,
} from '@prisma/client';

// ============================================================================
// Re-export Prisma Enums
// ============================================================================

export {
  Phase,
  NodeStatus,
  DocumentStatus,
  AIDraftStatus,
  AlertStatus,
  EdgeType,
  TemplateCategory,
  TemplateStatus,
  AlertSource,
  UpstreamActionType,
  DraftGenType,
  TaskStatus,
  JobStatus,
  UserRole,
  ConfigDataType,
  IssueSeverity,
  IssueType,
};

// ============================================================================
// Application-Level Enums
// ============================================================================

/**
 * Impact level classification for downstream document analysis
 */
export enum ImpactLevel {
  major = 'major',
  moderate = 'moderate',
  minor = 'minor',
}

/**
 * Alert issue type classification for impact assessment
 */
export enum AlertIssueType {
  RequirementMissing = 'RequirementMissing',
  Unclear = 'Unclear',
  Conflict = 'Conflict',
  Outdated = 'Outdated',
}

/**
 * Source relationship types for document dependencies
 */
export enum SourceRelationship {
  derives_from = 'derives_from',
  references = 'references',
  extends = 'extends',
  requires = 'requires',
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for Phase enum
 */
export function isPhase(value: unknown): value is Phase {
  return typeof value === 'string' && Object.values(Phase).includes(value as Phase);
}

/**
 * Type guard for NodeStatus enum
 */
export function isNodeStatus(value: unknown): value is NodeStatus {
  return typeof value === 'string' && Object.values(NodeStatus).includes(value as NodeStatus);
}

/**
 * Type guard for DocumentStatus enum
 */
export function isDocumentStatus(value: unknown): value is DocumentStatus {
  return typeof value === 'string' && Object.values(DocumentStatus).includes(value as DocumentStatus);
}

/**
 * Type guard for AIDraftStatus enum
 */
export function isAIDraftStatus(value: unknown): value is AIDraftStatus {
  return typeof value === 'string' && Object.values(AIDraftStatus).includes(value as AIDraftStatus);
}

/**
 * Type guard for UserRole enum
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && Object.values(UserRole).includes(value as UserRole);
}

/**
 * Type guard for EdgeType enum
 */
export function isEdgeType(value: unknown): value is EdgeType {
  return typeof value === 'string' && Object.values(EdgeType).includes(value as EdgeType);
}

/**
 * Type guard for AlertStatus enum
 */
export function isAlertStatus(value: unknown): value is AlertStatus {
  return typeof value === 'string' && Object.values(AlertStatus).includes(value as AlertStatus);
}

/**
 * Type guard for ImpactLevel enum
 */
export function isImpactLevel(value: unknown): value is ImpactLevel {
  return typeof value === 'string' && Object.values(ImpactLevel).includes(value as ImpactLevel);
}

/**
 * Type guard for IssueSeverity enum
 */
export function isIssueSeverity(value: unknown): value is IssueSeverity {
  return typeof value === 'string' && Object.values(IssueSeverity).includes(value as IssueSeverity);
}

/**
 * Type guard for IssueType enum
 */
export function isIssueType(value: unknown): value is IssueType {
  return typeof value === 'string' && Object.values(IssueType).includes(value as IssueType);
}

/**
 * Type guard for SourceRelationship enum
 */
export function isSourceRelationship(value: unknown): value is SourceRelationship {
  return typeof value === 'string' && Object.values(SourceRelationship).includes(value as SourceRelationship);
}

// ============================================================================
// Enum Helper Functions
// ============================================================================

/**
 * Phase ordering for comparison operations
 */
export const PhaseOrder: Record<Phase, number> = {
  [Phase.Inception]: 1,
  [Phase.Elaboration]: 2,
  [Phase.Construction]: 3,
  [Phase.Transition]: 4,
};

/**
 * Compare two phases by their order
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function comparePhases(a: Phase, b: Phase): -1 | 0 | 1 {
  const orderA = PhaseOrder[a];
  const orderB = PhaseOrder[b];
  if (orderA < orderB) return -1;
  if (orderA > orderB) return 1;
  return 0;
}

/**
 * NodeStatus ordering for comparison operations
 */
export const NodeStatusOrder: Record<NodeStatus, number> = {
  [NodeStatus.locked]: 1,
  [NodeStatus.available]: 2,
  [NodeStatus.in_progress]: 3,
  [NodeStatus.ready]: 4,
};

/**
 * Compare two node statuses by their order
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareNodeStatus(a: NodeStatus, b: NodeStatus): -1 | 0 | 1 {
  const orderA = NodeStatusOrder[a];
  const orderB = NodeStatusOrder[b];
  if (orderA < orderB) return -1;
  if (orderA > orderB) return 1;
  return 0;
}