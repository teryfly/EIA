/**
 * @fileoverview Common type definitions and utilities
 * Defines branded ID types, validation results, API responses, and helper functions
 */

// ============================================================================
// Branded ID Types
// ============================================================================

/**
 * Branded type pattern prevents accidental ID mixing at compile time
 * Example: ProjectId cannot be assigned to NodeInstanceId
 */

export type ProjectId = string & { __brand: 'ProjectId' };
export type NodeInstanceId = string & { __brand: 'NodeInstanceId' };
export type DocumentId = string & { __brand: 'DocumentId' };
export type TemplateId = string & { __brand: 'TemplateId' };
export type WorkflowId = string & { __brand: 'WorkflowId' };
export type UserId = string & { __brand: 'UserId' };

// ============================================================================
// UUID Validation
// ============================================================================

/**
 * Standard UUID format validation (accepts v1-v5)
 * Format: 8-4-4-4-12 hexadecimal characters
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 */
export function isUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

// ============================================================================
// Branded ID Creation Functions
// ============================================================================

/**
 * Create a branded ProjectId from a UUID string
 * @throws Error if the input is not a valid UUID
 */
export function createProjectId(uuid: string): ProjectId {
  if (!isUUID(uuid)) {
    throw new Error(`Invalid UUID format for ProjectId: ${uuid}`);
  }
  return uuid as ProjectId;
}

/**
 * Create a branded NodeInstanceId from a UUID string
 * @throws Error if the input is not a valid UUID
 */
export function createNodeInstanceId(uuid: string): NodeInstanceId {
  if (!isUUID(uuid)) {
    throw new Error(`Invalid UUID format for NodeInstanceId: ${uuid}`);
  }
  return uuid as NodeInstanceId;
}

/**
 * Create a branded DocumentId from a UUID string
 * @throws Error if the input is not a valid UUID
 */
export function createDocumentId(uuid: string): DocumentId {
  if (!isUUID(uuid)) {
    throw new Error(`Invalid UUID format for DocumentId: ${uuid}`);
  }
  return uuid as DocumentId;
}

/**
 * Create a branded TemplateId from a UUID string
 * @throws Error if the input is not a valid UUID
 */
export function createTemplateId(uuid: string): TemplateId {
  if (!isUUID(uuid)) {
    throw new Error(`Invalid UUID format for TemplateId: ${uuid}`);
  }
  return uuid as TemplateId;
}

/**
 * Create a branded WorkflowId from a string
 * Note: WorkflowId uses string IDs, not UUIDs
 */
export function createWorkflowId(id: string): WorkflowId {
  if (!id || id.trim().length === 0) {
    throw new Error('WorkflowId cannot be empty');
  }
  return id as WorkflowId;
}

/**
 * Create a branded UserId from a UUID string
 * @throws Error if the input is not a valid UUID
 */
export function createUserId(uuid: string): UserId {
  if (!isUUID(uuid)) {
    throw new Error(`Invalid UUID format for UserId: ${uuid}`);
  }
  return uuid as UserId;
}

// ============================================================================
// Common Type Aliases
// ============================================================================

/**
 * Standard UUID type alias
 */
export type UUID = string;

/**
 * ISO 8601 timestamp
 */
export type Timestamp = string;

/**
 * JSON-serializable value
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Validation & Response Types
// ============================================================================

/**
 * Validation result discriminated union
 */
export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[]; warnings?: string[] };

/**
 * Success response structure
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: Timestamp;
}

/**
 * Error detail structure
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: ErrorDetail[];
    path?: string;
  };
  timestamp: Timestamp;
}

/**
 * Unified API response type
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Type Guards for Responses
// ============================================================================

/**
 * Type guard for SuccessResponse
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard for ErrorResponse
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ErrorResponse {
  return response.success === false;
}

/**
 * Type guard for ValidationResult success
 */
export function isValidationSuccess<T>(result: ValidationResult<T>): result is { valid: true; data: T } {
  return result.valid === true;
}

/**
 * Type guard for ValidationResult failure
 */
export function isValidationFailure<T>(
  result: ValidationResult<T>
): result is { valid: false; errors: string[]; warnings?: string[] } {
  return result.valid === false;
}

// ============================================================================
// Response Factory Functions
// ============================================================================

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  details?: ErrorDetail[],
  path?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
      path,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Date range filter for queries
 */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

/**
 * Search filter for text queries
 */
export interface SearchFilter {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
}