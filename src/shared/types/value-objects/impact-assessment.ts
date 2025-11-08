/**
 * @fileoverview ImpactAssessment value object
 * Represents AI-generated impact analysis results
 */

import { z } from 'zod';
import { ImpactLevel, AlertIssueType } from '../enums';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Assessed document with impact details
 */
export interface AssessedDocument {
  documentId: string;
  documentName: string;
  impactLevel: ImpactLevel;
  issueType?: AlertIssueType;
  suggestions: string;
}

/**
 * Assessed node with aggregated document impacts
 */
export interface AssessedNode {
  nodeId: string;
  nodeName: string;
  overallImpact: ImpactLevel;
  documents: AssessedDocument[];
}

/**
 * Complete impact assessment result
 */
export interface ImpactAssessment {
  summary: string;
  needsRegeneration: boolean;
  hasIssue: boolean;
  affectedNodes: AssessedNode[];
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for AssessedDocument
 */
export const AssessedDocumentSchema = z.object({
  documentId: z.string().uuid(),
  documentName: z.string().min(1),
  impactLevel: z.nativeEnum(ImpactLevel),
  issueType: z.nativeEnum(AlertIssueType).optional(),
  suggestions: z.string(),
});

/**
 * Schema for AssessedNode
 */
export const AssessedNodeSchema = z.object({
  nodeId: z.string().uuid(),
  nodeName: z.string().min(1),
  overallImpact: z.nativeEnum(ImpactLevel),
  documents: z.array(AssessedDocumentSchema),
});

/**
 * Schema for ImpactAssessment
 */
export const ImpactAssessmentSchema = z.object({
  summary: z.string(),
  needsRegeneration: z.boolean(),
  hasIssue: z.boolean(),
  affectedNodes: z.array(AssessedNodeSchema),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for ImpactAssessment
 */
export function isImpactAssessment(value: unknown): value is ImpactAssessment {
  const result = ImpactAssessmentSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all documents with high impact (major level)
 */
export function getHighImpactDocuments(assessment: ImpactAssessment): AssessedDocument[] {
  return assessment.affectedNodes.flatMap((node) =>
    node.documents.filter((doc) => doc.impactLevel === ImpactLevel.major)
  );
}

/**
 * Get all documents with major impact
 */
export function getMajorImpactDocuments(assessment: ImpactAssessment): AssessedDocument[] {
  return getHighImpactDocuments(assessment);
}

/**
 * Get all documents with moderate impact
 */
export function getModerateImpactDocuments(assessment: ImpactAssessment): AssessedDocument[] {
  return assessment.affectedNodes.flatMap((node) =>
    node.documents.filter((doc) => doc.impactLevel === ImpactLevel.moderate)
  );
}

/**
 * Get all documents with minor impact
 */
export function getMinorImpactDocuments(assessment: ImpactAssessment): AssessedDocument[] {
  return assessment.affectedNodes.flatMap((node) =>
    node.documents.filter((doc) => doc.impactLevel === ImpactLevel.minor)
  );
}

/**
 * Check if assessment has any issues
 */
export function hasAnyIssues(assessment: ImpactAssessment): boolean {
  return assessment.hasIssue;
}

/**
 * Get count of affected nodes
 */
export function getAffectedNodeCount(assessment: ImpactAssessment): number {
  return assessment.affectedNodes.length;
}

/**
 * Get total count of affected documents
 */
export function getAffectedDocumentCount(assessment: ImpactAssessment): number {
  return assessment.affectedNodes.reduce((total, node) => total + node.documents.length, 0);
}

/**
 * Get all documents with issues
 */
export function getDocumentsWithIssues(assessment: ImpactAssessment): AssessedDocument[] {
  return assessment.affectedNodes.flatMap((node) =>
    node.documents.filter((doc) => doc.issueType !== undefined)
  );
}

/**
 * Get documents grouped by impact level
 */
export function getDocumentsByImpactLevel(assessment: ImpactAssessment): Record<ImpactLevel, AssessedDocument[]> {
  return {
    [ImpactLevel.major]: getMajorImpactDocuments(assessment),
    [ImpactLevel.moderate]: getModerateImpactDocuments(assessment),
    [ImpactLevel.minor]: getMinorImpactDocuments(assessment),
  };
}