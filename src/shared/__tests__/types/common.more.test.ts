import { describe, it, expect } from 'vitest';
import {
  isUUID,
  createProjectId,
  createNodeInstanceId,
  createDocumentId,
  createTemplateId,
  createUserId,
  createWorkflowId,
  createSuccessResponse,
  createErrorResponse,
  isSuccessResponse,
  isErrorResponse,
  isValidationSuccess,
  isValidationFailure,
  type ValidationResult
} from '@/shared/types/common';

describe('shared/types/common helpers - additional coverage', () => {
  const uuid = '123e4567-e89b-12d3-a456-426614174000';

  it('UUID validators and creators', () => {
    expect(isUUID(uuid)).toBe(true);
    expect(() => createProjectId('bad')).toThrow();
    expect(() => createUserId('bad')).toThrow();
    expect(createProjectId(uuid)).toBe(uuid);
    expect(createNodeInstanceId(uuid)).toBe(uuid);
    expect(createDocumentId(uuid)).toBe(uuid);
    expect(createTemplateId(uuid)).toBe(uuid);
    expect(createUserId(uuid)).toBe(uuid);
    expect(createWorkflowId('wf')).toBe('wf');
    expect(() => createWorkflowId('')).toThrow();
  });

  it('ApiResponse factories and type guards', () => {
    const ok = createSuccessResponse({ a: 1 }, 'done');
    expect(isSuccessResponse(ok)).toBe(true);
    expect(ok.message).toBe('done');

    const err = createErrorResponse('oops', 'E123');
    expect(isErrorResponse(err)).toBe(true);
    expect(err.error.code).toBe('E123');
  });

  it('ValidationResult guards', () => {
    const good: ValidationResult<number> = { valid: true, data: 1 };
    const bad: ValidationResult<number> = { valid: false, errors: ['e'] };
    expect(isValidationSuccess(good)).toBe(true);
    expect(isValidationFailure(bad)).toBe(true);
  });
});