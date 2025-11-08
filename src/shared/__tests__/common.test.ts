import { describe, it, expect } from 'vitest';
import {
  isUUID,
  createProjectId,
  createNodeInstanceId,
  createDocumentId,
  createTemplateId,
  createWorkflowId,
  createUserId,
  isSuccessResponse,
  isErrorResponse,
  isValidationSuccess,
  isValidationFailure,
  createSuccessResponse,
  createErrorResponse,
} from '../types/common';
describe('UUID Validation', () => {
  describe('isUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      expect(isUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      expect(isUUID('550e8400-e29b-51d4-a716-446655440000')).toBe(true); // UUID v5 is valid
    });
    it('should return false for invalid UUIDs', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isUUID('550e8400-e29b-g1d4-a716-446655440000')).toBe(false); // Invalid hex character 'g'
      expect(isUUID('')).toBe(false);
      expect(isUUID('123')).toBe(false);
      expect(isUUID('550e8400e29b41d4a716446655440000')).toBe(false); // Missing dashes
    });
  });
});
describe('Branded ID Creation', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const invalidUUID = 'not-a-uuid';
  describe('createProjectId', () => {
    it('should create ProjectId from valid UUID', () => {
      const id = createProjectId(validUUID);
      expect(id).toBe(validUUID);
    });
    it('should throw error for invalid UUID', () => {
      expect(() => createProjectId(invalidUUID)).toThrow('Invalid UUID format for ProjectId');
    });
  });
  describe('createNodeInstanceId', () => {
    it('should create NodeInstanceId from valid UUID', () => {
      const id = createNodeInstanceId(validUUID);
      expect(id).toBe(validUUID);
    });
    it('should throw error for invalid UUID', () => {
      expect(() => createNodeInstanceId(invalidUUID)).toThrow('Invalid UUID format for NodeInstanceId');
    });
  });
  describe('createDocumentId', () => {
    it('should create DocumentId from valid UUID', () => {
      const id = createDocumentId(validUUID);
      expect(id).toBe(validUUID);
    });
    it('should throw error for invalid UUID', () => {
      expect(() => createDocumentId(invalidUUID)).toThrow('Invalid UUID format for DocumentId');
    });
  });
  describe('createTemplateId', () => {
    it('should create TemplateId from valid UUID', () => {
      const id = createTemplateId(validUUID);
      expect(id).toBe(validUUID);
    });
    it('should throw error for invalid UUID', () => {
      expect(() => createTemplateId(invalidUUID)).toThrow('Invalid UUID format for TemplateId');
    });
  });
  describe('createWorkflowId', () => {
    it('should create WorkflowId from non-empty string', () => {
      const id = createWorkflowId('wf-requirements');
      expect(id).toBe('wf-requirements');
    });
    it('should throw error for empty string', () => {
      expect(() => createWorkflowId('')).toThrow('WorkflowId cannot be empty');
      expect(() => createWorkflowId('   ')).toThrow('WorkflowId cannot be empty');
    });
  });
  describe('createUserId', () => {
    it('should create UserId from valid UUID', () => {
      const id = createUserId(validUUID);
      expect(id).toBe(validUUID);
    });
    it('should throw error for invalid UUID', () => {
      expect(() => createUserId(invalidUUID)).toThrow('Invalid UUID format for UserId');
    });
  });
});
describe('Response Type Guards', () => {
  describe('isSuccessResponse', () => {
    it('should return true for success responses', () => {
      const response = createSuccessResponse({ id: '123' }, 'Success');
      expect(isSuccessResponse(response)).toBe(true);
    });
    it('should return false for error responses', () => {
      const response = createErrorResponse('Error occurred', 'ERR_001');
      expect(isSuccessResponse(response)).toBe(false);
    });
  });
  describe('isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response = createErrorResponse('Error occurred', 'ERR_001');
      expect(isErrorResponse(response)).toBe(true);
    });
    it('should return false for success responses', () => {
      const response = createSuccessResponse({ id: '123' });
      expect(isErrorResponse(response)).toBe(false);
    });
  });
  describe('isValidationSuccess', () => {
    it('should return true for valid results', () => {
      const result = { valid: true as const, data: { name: 'Test' } };
      expect(isValidationSuccess(result)).toBe(true);
    });
    it('should return false for invalid results', () => {
      const result = { valid: false as const, errors: ['Error'] };
      expect(isValidationSuccess(result)).toBe(false);
    });
  });
  describe('isValidationFailure', () => {
    it('should return true for invalid results', () => {
      const result = { valid: false as const, errors: ['Error'] };
      expect(isValidationFailure(result)).toBe(true);
    });
    it('should return false for valid results', () => {
      const result = { valid: true as const, data: { name: 'Test' } };
      expect(isValidationFailure(result)).toBe(false);
    });
  });
});
describe('Response Factory Functions', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const response = createSuccessResponse(data);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
      expect(response.message).toBeUndefined();
    });
    it('should create success response with message', () => {
      const data = { id: '123' };
      const message = 'Operation successful';
      const response = createSuccessResponse(data, message);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe(message);
      expect(response.timestamp).toBeDefined();
    });
    it('should include valid ISO timestamp', () => {
      const response = createSuccessResponse({ id: '123' });
      expect(() => new Date(response.timestamp)).not.toThrow();
    });
  });
  describe('createErrorResponse', () => {
    it('should create error response with message and code', () => {
      const message = 'Something went wrong';
      const code = 'ERR_001';
      const response = createErrorResponse(message, code);
      expect(response.success).toBe(false);
      expect(response.error.message).toBe(message);
      expect(response.error.code).toBe(code);
      expect(response.timestamp).toBeDefined();
    });
    it('should create error response with details', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const response = createErrorResponse('Validation failed', 'VALIDATION_ERROR', details);
      expect(response.error.details).toEqual(details);
    });
    it('should create error response with path', () => {
      const path = '/api/users/123';
      const response = createErrorResponse('Not found', 'NOT_FOUND', undefined, path);
      expect(response.error.path).toBe(path);
    });
    it('should include valid ISO timestamp', () => {
      const response = createErrorResponse('Error', 'ERR_001');
      expect(() => new Date(response.timestamp)).not.toThrow();
    });
  });
});