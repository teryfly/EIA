/**
 * @fileoverview BackgroundGenerationTask value object
 * Represents a background AI draft generation task triggered by rejection
 */

import { z } from 'zod';
import { TaskStatus } from '../enums';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * BackgroundGenerationTask interface
 */
export interface BackgroundGenerationTask {
  conversationSessionId: string;
  triggeredBy: string;
  triggerMessage: string;
  status: TaskStatus;
  generatedDraftIds: string[];
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Zod Schema
// ============================================================================

/**
 * Schema for BackgroundGenerationTask
 */
export const BackgroundGenerationTaskSchema = z.object({
  conversationSessionId: z.string().uuid(),
  triggeredBy: z.string().min(1),
  triggerMessage: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
  generatedDraftIds: z.array(z.string()),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard for BackgroundGenerationTask
 */
export function isBackgroundGenerationTask(value: unknown): value is BackgroundGenerationTask {
  const result = BackgroundGenerationTaskSchema.safeParse(value);
  return result.success;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if task is pending
 */
export function isPending(task: BackgroundGenerationTask): boolean {
  return task.status === TaskStatus.pending;
}

/**
 * Check if task is running
 */
export function isRunning(task: BackgroundGenerationTask): boolean {
  return task.status === TaskStatus.running;
}

/**
 * Check if task is completed
 */
export function isCompleted(task: BackgroundGenerationTask): boolean {
  return task.status === TaskStatus.completed;
}

/**
 * Check if task has failed
 */
export function isFailed(task: BackgroundGenerationTask): boolean {
  return task.status === TaskStatus.failed;
}

/**
 * Get task duration in milliseconds
 */
export function getTaskDuration(task: BackgroundGenerationTask): number | null {
  if (!task.completedAt) {
    return null;
  }
  return task.completedAt.getTime() - task.createdAt.getTime();
}