import { CrossFlowDependency as PrismaCrossFlowDependency, EdgeType } from '@prisma/client';
import { CrossFlowDependencyAddedEvent, CrossFlowDependencyUpdatedEvent } from '../events';

export class CrossFlowDependencyEntity {
  private domainEvents: any[] = [];

  private constructor(
    public readonly id: string,
    public readonly rupTemplateId: string,
    public readonly sourceWorkflowId: string,
    public readonly sourceNodeId: string,
    public readonly sourceFullId: string,
    public readonly targetWorkflowId: string,
    public readonly targetNodeId: string,
    public readonly targetFullId: string,
    public type: EdgeType,
    public displayLabel: string | null,
    public description: string | null,
    public weight: number,
    public notes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    rupTemplateId: string;
    sourceWorkflowId: string;
    sourceNodeId: string;
    sourceFullId: string;
    targetWorkflowId: string;
    targetNodeId: string;
    targetFullId: string;
    type: EdgeType;
    displayLabel?: string;
    description?: string;
    weight?: number;
    notes?: string;
  }): CrossFlowDependencyEntity {
    const now = new Date();
    const dep = new CrossFlowDependencyEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      data.rupTemplateId,
      data.sourceWorkflowId,
      data.sourceNodeId,
      data.sourceFullId,
      data.targetWorkflowId,
      data.targetNodeId,
      data.targetFullId,
      data.type,
      data.displayLabel ?? null,
      data.description ?? null,
      data.weight ?? 1,
      data.notes ?? null,
      now,
      now
    );
    dep.validateDependency();
    dep.addDomainEvent(
      new CrossFlowDependencyAddedEvent(dep.id, dep.rupTemplateId, dep.sourceFullId, dep.targetFullId, dep.type)
    );
    return dep;
  }

  static fromPrisma(prisma: PrismaCrossFlowDependency): CrossFlowDependencyEntity {
    return new CrossFlowDependencyEntity(
      prisma.id,
      prisma.rupTemplateId,
      prisma.sourceWorkflowId,
      prisma.sourceNodeId,
      prisma.sourceFullId,
      prisma.targetWorkflowId,
      prisma.targetNodeId,
      prisma.targetFullId,
      prisma.type,
      prisma.displayLabel ?? null,
      prisma.description ?? null,
      prisma.weight,
      prisma.notes ?? null,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: { type?: EdgeType; displayLabel?: string; description?: string; weight?: number; notes?: string }): void {
    if (data.type !== undefined) this.type = data.type;
    if (data.displayLabel !== undefined) this.displayLabel = data.displayLabel;
    if (data.description !== undefined) this.description = data.description;
    if (data.weight !== undefined) {
      if (data.weight < 0) throw new Error('Dependency weight must be non-negative');
      this.weight = data.weight;
    }
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.addDomainEvent(new CrossFlowDependencyUpdatedEvent(this.id, this.rupTemplateId));
  }

  private validateDependency(): void {
    if (!this.sourceFullId || !this.targetFullId) throw new Error('Dependency must have source and target');
    if (this.sourceFullId === this.targetFullId) {
      throw new Error('Dependency cannot point to itself (self-referencing dependency)');
    }
    if (this.weight < 0) throw new Error('Dependency weight must be non-negative');

    if (!this.sourceFullId.includes('.')) {
      throw new Error(`Invalid source fullId format: ${this.sourceFullId}. Expected format: "workflowId.nodeId"`);
    }
    if (!this.targetFullId.includes('.')) {
      throw new Error(`Invalid target fullId format: ${this.targetFullId}. Expected format: "workflowId.nodeId"`);
    }

    const [sourceWorkflowFromFull, sourceNodeFromFull] = this.sourceFullId.split('.');
    const [targetWorkflowFromFull, targetNodeFromFull] = this.targetFullId.split('.');

    if (sourceWorkflowFromFull === targetWorkflowFromFull) {
      throw new Error(
        `Cross-flow dependency must connect nodes in different workflows. Both nodes are in workflow: ${sourceWorkflowFromFull}. Use FlowTemplateEdge for flow-internal dependencies.`
      );
    }

    if (sourceWorkflowFromFull !== this.sourceWorkflowId) {
      throw new Error(
        `Source fullId workflow (${sourceWorkflowFromFull}) does not match sourceWorkflowId (${this.sourceWorkflowId})`
      );
    }
    if (targetWorkflowFromFull !== this.targetWorkflowId) {
      throw new Error(
        `Target fullId workflow (${targetWorkflowFromFull}) does not match targetWorkflowId (${this.targetWorkflowId})`
      );
    }
    if (sourceNodeFromFull !== this.sourceNodeId) {
      throw new Error(
        `Source fullId node (${sourceNodeFromFull}) does not match sourceNodeId (${this.sourceNodeId})`
      );
    }
    if (targetNodeFromFull !== this.targetNodeId) {
      throw new Error(
        `Target fullId node (${targetNodeFromFull}) does not match targetNodeId (${this.targetNodeId})`
      );
    }
  }

  isRequired(): boolean {
    return this.type === EdgeType.required;
  }

  isOptional(): boolean {
    return this.type === EdgeType.optional;
  }

  getDisplayLabel(): string {
    if (this.displayLabel) return this.displayLabel;
    return `${this.sourceWorkflowId}.${this.sourceNodeId} → ${this.targetWorkflowId}.${this.targetNodeId}`;
  }

  toPrisma(): Omit<PrismaCrossFlowDependency, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      rupTemplateId: this.rupTemplateId,
      sourceWorkflowId: this.sourceWorkflowId,
      sourceNodeId: this.sourceNodeId,
      sourceFullId: this.sourceFullId,
      targetWorkflowId: this.targetWorkflowId,
      targetNodeId: this.targetNodeId,
      targetFullId: this.targetFullId,
      type: this.type,
      displayLabel: this.displayLabel ?? undefined,
      description: this.description ?? undefined,
      weight: this.weight,
      notes: this.notes ?? undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return {
      id: this.id,
      rupTemplateId: this.rupTemplateId,
      sourceWorkflowId: this.sourceWorkflowId,
      sourceNodeId: this.sourceNodeId,
      sourceFullId: this.sourceFullId,
      targetWorkflowId: this.targetWorkflowId,
      targetNodeId: this.targetNodeId,
      targetFullId: this.targetFullId,
      type: this.type,
      displayLabel: this.getDisplayLabel(),
      description: this.description,
      weight: this.weight,
      notes: this.notes,
      isRequired: this.isRequired(),
      isOptional: this.isOptional(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
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