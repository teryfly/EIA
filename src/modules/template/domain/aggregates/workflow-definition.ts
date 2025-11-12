import { WorkflowDefinition as PrismaWorkflowDefinition } from '@prisma/client';
import { Phase } from '@/shared/types/enums';
import { WorkflowAddedEvent, WorkflowUpdatedEvent } from '../events';

export class WorkflowDefinition {
  private domainEvents: any[] = [];

  private constructor(
    public readonly id: string,
    public readonly rupTemplateId: string,
    public name: string,
    public code: string,
    public priority: number,
    public estimatedDuration: string | null,
    public description: string | null,
    public phases: Phase[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    rupTemplateId: string;
    name: string;
    code: string;
    priority?: number;
    estimatedDuration?: string;
    description?: string;
    phases: Phase[];
  }): WorkflowDefinition {
    const now = new Date();
    const workflow = new WorkflowDefinition(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      data.rupTemplateId,
      data.name,
      data.code,
      data.priority ?? 0,
      data.estimatedDuration ?? null,
      data.description ?? null,
      data.phases,
      now,
      now
    );
    workflow.validatePhases();
    workflow.validateName(data.name);
    workflow.addDomainEvent(new WorkflowAddedEvent(workflow.id, workflow.rupTemplateId, workflow.name, workflow.code));
    return workflow;
  }

  static fromPrisma(prisma: PrismaWorkflowDefinition): WorkflowDefinition {
    return new WorkflowDefinition(
      prisma.id,
      prisma.rupTemplateId,
      prisma.name,
      prisma.code,
      prisma.priority,
      prisma.estimatedDuration,
      prisma.description,
      prisma.phases as Phase[],
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: {
    name?: string;
    description?: string;
    estimatedDuration?: string;
    priority?: number;
    phases?: Phase[];
  }): void {
    let changed = false;

    if (data.name !== undefined && data.name !== this.name) {
      this.validateName(data.name);
      this.name = data.name;
      changed = true;
    }
    if (data.description !== undefined && data.description !== this.description) {
      this.description = data.description;
      changed = true;
    }
    if (data.estimatedDuration !== undefined && data.estimatedDuration !== this.estimatedDuration) {
      this.estimatedDuration = data.estimatedDuration;
      changed = true;
    }
    if (data.priority !== undefined && data.priority !== this.priority) {
      if (data.priority < 0) throw new Error('Priority must be non-negative');
      this.priority = data.priority;
      changed = true;
    }
    if (data.phases !== undefined) {
      const sameLength = data.phases.length === this.phases.length;
      const sameValues =
        sameLength && data.phases.every((p, idx) => p === this.phases[idx]);
      if (!sameValues) {
        this.phases = data.phases;
        this.validatePhases();
        changed = true;
      }
    }

    if (changed) {
      this.updatedAt = new Date();
      this.addDomainEvent(new WorkflowUpdatedEvent(this.id, this.rupTemplateId));
    }
  }

  isPhaseAllowed(phase: Phase): boolean {
    return this.phases.includes(phase);
  }

  hasNodes(): boolean {
    return true;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) throw new Error('Workflow name cannot be empty');
    if (name.length < 2 || name.length > 100) throw new Error('Workflow name must be between 2 and 100 characters');
  }

  private validatePhases(): void {
    if (this.phases.length === 0) throw new Error('Workflow must have at least one phase');
    const uniquePhases = new Set(this.phases);
    if (uniquePhases.size !== this.phases.length) throw new Error('Workflow phases must be unique');
    const validPhases = Object.values(Phase);
    for (const phase of this.phases) {
      if (!validPhases.includes(phase)) throw new Error(`Invalid phase: ${phase}`);
    }
  }

  toPrisma(): Omit<PrismaWorkflowDefinition, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      rupTemplateId: this.rupTemplateId,
      name: this.name,
      code: this.code,
      priority: this.priority,
      estimatedDuration: this.estimatedDuration,
      description: this.description,
      phases: this.phases,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}