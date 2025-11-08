/**
 * @fileoverview Shared module exports
 * Centralized export point for all shared types, enums, and utilities
 */

// ============================================================================
// Enums
// ============================================================================

export {
  // Prisma enums
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
  PrerequisiteType,
  // Application enums
  ImpactLevel,
  AlertIssueType,
  SourceRelationship,
  // Type guards
  isPhase,
  isNodeStatus,
  isDocumentStatus,
  isAIDraftStatus,
  isUserRole,
  isEdgeType,
  isAlertStatus,
  isImpactLevel,
  isIssueSeverity,
  isIssueType,
  isPrerequisiteType,
  isSourceRelationship,
  // Helper functions
  PhaseOrder,
  comparePhases,
  NodeStatusOrder,
  compareNodeStatus,
} from './types/enums';

// ============================================================================
// Common Types
// ============================================================================

export {
  // Branded ID types
  type ProjectId,
  type NodeInstanceId,
  type DocumentId,
  type TemplateId,
  type WorkflowId,
  type UserId,
  // ID creation functions
  createProjectId,
  createNodeInstanceId,
  createDocumentId,
  createTemplateId,
  createWorkflowId,
  createUserId,
  // UUID validation
  isUUID,
  // Type aliases
  type UUID,
  type Timestamp,
  type JSONValue,
  type JSONObject,
  type JSONArray,
  // Pagination
  type PaginationParams,
  type PaginatedResult,
  // Validation & Response
  type ValidationResult,
  type SuccessResponse,
  type ErrorResponse,
  type ErrorDetail,
  type ApiResponse,
  // Type guards
  isSuccessResponse,
  isErrorResponse,
  isValidationSuccess,
  isValidationFailure,
  // Factory functions
  createSuccessResponse,
  createErrorResponse,
  // Filters
  type DateRangeFilter,
  type SearchFilter,
} from './types/common';

// ============================================================================
// Value Objects
// ============================================================================

export {
  // CompletionCondition
  type CompletionConditionBase,
  type ManualConfirmCondition,
  type MinDocumentsCondition,
  type ChecklistCondition,
  type ChecklistItem,
  type CompletionCondition,
  CompletionConditionSchema,
  ManualConfirmConditionSchema,
  MinDocumentsConditionSchema,
  ChecklistConditionSchema,
  ChecklistItemSchema,
  isCompletionCondition,
  isManualConfirmCondition,
  isMinDocumentsCondition,
  isChecklistCondition,
  createManualConfirmCondition,
  createMinDocumentsCondition,
  createChecklistCondition,
  createChecklistItem,
} from './types/value-objects/completion-condition';

export {
  // Prerequisite
  type Prerequisite,
  PrerequisiteSchema,
  isPrerequisite,
  areAllRequiredPrerequisitesSatisfied,
  getUnsatisfiedRequiredPrerequisites,
  getOptionalPrerequisites,
  getSatisfiedPrerequisites,
  getPrerequisiteCount,
} from './types/value-objects/prerequisite';

export {
  // TriggerSource
  type TriggerSource,
  TriggerSourceSchema,
  isTriggerSource,
  createTriggerSource,
  isRollbackVersion,
  getVersionNumber,
  createRollbackVersion,
} from './types/value-objects/trigger-source';

export {
  // ImpactAssessment
  type AssessedDocument,
  type AssessedNode,
  type ImpactAssessment,
  AssessedDocumentSchema,
  AssessedNodeSchema,
  ImpactAssessmentSchema,
  isImpactAssessment,
  getHighImpactDocuments,
  getMajorImpactDocuments,
  getModerateImpactDocuments,
  getMinorImpactDocuments,
  hasAnyIssues,
  getAffectedNodeCount,
  getAffectedDocumentCount,
  getDocumentsWithIssues,
  getDocumentsByImpactLevel,
} from './types/value-objects/impact-assessment';

export {
  // InputDocumentRef
  type InputDocumentRef,
  InputDocumentRefSchema,
  isInputDocumentRef,
  createInputDocumentRef,
} from './types/value-objects/input-document-ref';

export {
  // ValidationIssue
  type ValidationIssue,
  ValidationIssueSchema,
  isValidationIssue,
  isResolved,
  isErrorIssue,
  isWarningIssue,
  isInfoIssue,
} from './types/value-objects/validation-issue';

export {
  // BackgroundGenerationTask
  type BackgroundGenerationTask,
  BackgroundGenerationTaskSchema,
  isBackgroundGenerationTask,
  isPending,
  isRunning,
  isCompleted,
  isFailed,
  getTaskDuration,
} from './types/value-objects/background-generation-task';