/**
 * @fileoverview Shared module exports
 * Centralized export point for all shared types, enums, and utilities
 */

// ============================================================================
// Enums
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
  PrerequisiteType,
  ImpactLevel,
  AlertIssueType,
  SourceRelationship,
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
  PhaseOrder,
  comparePhases,
  NodeStatusOrder,
  compareNodeStatus,
} from './types/enums';

// ============================================================================
// Common Types
// ============================================================================
export {
  type ProjectId,
  type NodeInstanceId,
  type DocumentId,
  type TemplateId,
  type WorkflowId,
  type UserId,
  createProjectId,
  createNodeInstanceId,
  createDocumentId,
  createTemplateId,
  createWorkflowId,
  createUserId,
  isUUID,
  type UUID,
  type Timestamp,
  type JSONValue,
  type JSONObject,
  type JSONArray,
  type PaginationParams,
  type PaginatedResult,
  type ValidationResult,
  type SuccessResponse,
  type ErrorResponse,
  type ErrorDetail,
  type ApiResponse,
  isSuccessResponse,
  isErrorResponse,
  isValidationSuccess,
  isValidationFailure,
  createSuccessResponse,
  createErrorResponse,
  type DateRangeFilter,
  type SearchFilter,
} from './types/common';

// ============================================================================
// Value Objects
// ============================================================================
export {
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
  type TriggerSource,
  TriggerSourceSchema,
  isTriggerSource,
  createTriggerSource,
  isRollbackVersion,
  getVersionNumber,
  createRollbackVersion,
} from './types/value-objects/trigger-source';

export {
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
  type InputDocumentRef,
  InputDocumentRefSchema,
  isInputDocumentRef,
  createInputDocumentRef,
} from './types/value-objects/input-document-ref';

export {
  type ValidationIssue,
  ValidationIssueSchema,
  isValidationIssue,
  isResolved,
  isErrorIssue,
  isWarningIssue,
  isInfoIssue,
} from './types/value-objects/validation-issue';

export {
  type BackgroundGenerationTask,
  BackgroundGenerationTaskSchema,
  isBackgroundGenerationTask,
  isPending,
  isRunning,
  isCompleted,
  isFailed,
  getTaskDuration,
} from './types/value-objects/background-generation-task';

// ============================================================================
// Graph Utilities (M03B-1)
// ============================================================================
export {
  type GraphEdge,
  type CycleDetectionResult,
  buildAdjacencyList,
  buildWeightedAdjacencyList,
  detectCycle,
  wouldCreateCycle,
  findAllPaths,
  getDownstreamNodes,
  getUpstreamNodes,
  topologicalSort,
  hasPath,
  getStronglyConnectedComponents,
  countNodes,
  countEdges,
  findSourceNodes,
  findSinkNodes
} from './utils/graph-utils';