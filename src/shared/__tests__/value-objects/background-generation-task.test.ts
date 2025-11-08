import { describe, it, expect } from 'vitest';
import { TaskStatus } from '../../types/enums';
import {
  BackgroundGenerationTaskSchema,
  isBackgroundGenerationTask,
  isPending,
  isRunning,
  isCompleted,
  isFailed,
  getTaskDuration,
  type BackgroundGenerationTask,
} from '../../types/value-objects/background-generation-task';

describe('BackgroundGenerationTask Value Object', () => {
  const validTask: BackgroundGenerationTask = {
    conversationSessionId: '550e8400-e29b-41d4-a716-446655440000',
    triggeredBy: 'user-rejection',
    triggerMessage: 'Please regenerate with more detail',
    status: TaskStatus.pending,
    generatedDraftIds: [],
    createdAt: new Date('2024-01-01T10:00:00Z'),
  };

  describe('Schema Validation', () => {
    it('should validate valid task', () => {
      const result = BackgroundGenerationTaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should validate completed task', () => {
      const completed = {
        ...validTask,
        status: TaskStatus.completed,
        generatedDraftIds: ['AI-001', 'AI-002'],
        completedAt: new Date('2024-01-01T10:05:00Z'),
      };
      const result = BackgroundGenerationTaskSchema.safeParse(completed);
      expect(result.success).toBe(true);
    });

    it('should validate failed task', () => {
      const failed = {
        ...validTask,
        status: TaskStatus.failed,
        errorMessage: 'AI service timeout',
        completedAt: new Date('2024-01-01T10:03:00Z'),
      };
      const result = BackgroundGenerationTaskSchema.safeParse(failed);
      expect(result.success).toBe(true);
    });

    it('should reject invalid conversation session ID', () => {
      const invalid = { ...validTask, conversationSessionId: 'not-a-uuid' };
      const result = BackgroundGenerationTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty triggeredBy', () => {
      const invalid = { ...validTask, triggeredBy: '' };
      const result = BackgroundGenerationTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty triggerMessage', () => {
      const invalid = { ...validTask, triggerMessage: '' };
      const result = BackgroundGenerationTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalid = { ...validTask, status: 'invalid' };
      const result = BackgroundGenerationTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid task', () => {
      expect(isBackgroundGenerationTask(validTask)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isBackgroundGenerationTask(null)).toBe(false);
      expect(isBackgroundGenerationTask({})).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    describe('isPending', () => {
      it('should return true for pending status', () => {
        const task = { ...validTask, status: TaskStatus.pending };
        expect(isPending(task)).toBe(true);
      });

      it('should return false for non-pending status', () => {
        const task = { ...validTask, status: TaskStatus.running };
        expect(isPending(task)).toBe(false);
      });
    });

    describe('isRunning', () => {
      it('should return true for running status', () => {
        const task = { ...validTask, status: TaskStatus.running };
        expect(isRunning(task)).toBe(true);
      });

      it('should return false for non-running status', () => {
        const task = { ...validTask, status: TaskStatus.completed };
        expect(isRunning(task)).toBe(false);
      });
    });

    describe('isCompleted', () => {
      it('should return true for completed status', () => {
        const task = { ...validTask, status: TaskStatus.completed };
        expect(isCompleted(task)).toBe(true);
      });

      it('should return false for non-completed status', () => {
        const task = { ...validTask, status: TaskStatus.failed };
        expect(isCompleted(task)).toBe(false);
      });
    });

    describe('isFailed', () => {
      it('should return true for failed status', () => {
        const task = { ...validTask, status: TaskStatus.failed };
        expect(isFailed(task)).toBe(true);
      });

      it('should return false for non-failed status', () => {
        const task = { ...validTask, status: TaskStatus.completed };
        expect(isFailed(task)).toBe(false);
      });
    });

    describe('getTaskDuration', () => {
      it('should return duration in milliseconds for completed task', () => {
        const task = {
          ...validTask,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          completedAt: new Date('2024-01-01T10:05:00Z'),
        };
        expect(getTaskDuration(task)).toBe(5 * 60 * 1000); // 5 minutes
      });

      it('should return null for task without completedAt', () => {
        expect(getTaskDuration(validTask)).toBeNull();
      });

      it('should handle zero duration', () => {
        const sameTime = new Date('2024-01-01T10:00:00Z');
        const task = {
          ...validTask,
          createdAt: sameTime,
          completedAt: sameTime,
        };
        expect(getTaskDuration(task)).toBe(0);
      });
    });
  });
});