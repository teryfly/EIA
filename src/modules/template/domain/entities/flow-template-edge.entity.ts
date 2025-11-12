import { FlowTemplateEdge as PrismaFlowTemplateEdge, EdgeType } from '@prisma/client';
import { EdgeAddedEvent, EdgeUpdatedEvent } from '../events';

export class FlowTemplateEdgeEntity {
  private domainEvents: any[] = [];

  private constructor(
    public readonly id: string,
    public readonly workflowDefinitionId: string,
    public source: string,
    public target: string,
    public type: EdgeType,
    public label: string | null,
    public weight: number,
    public notes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    workflowDefinitionId: string;
    source: string;
    target: string;
    type: EdgeType;
    label?: string;
    weight?: number;
    notes?: string;
  }): FlowTemplateEdgeEntity {
    const now = new Date();
    const edge = new FlowTemplateEdgeEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      data.workflowDefinitionId,
      data.source,
      data.target,
      data.type,
      data.label ?? null,
      data.weight ?? 1,
      data.notes ?? null,
      now,
      now
    );
    edge.validateEdge();
    edge.addDomainEvent(
      new EdgeAddedEvent(edge.id, edge.workflowDefinitionId, edge.source, edge.target, edge.type)
    );
    return edge;
  }

  static fromPrisma(prisma: PrismaFlowTemplateEdge): FlowTemplateEdgeEntity {
    return new FlowTemplateEdgeEntity(
      prisma.id,
      prisma.workflowDefinitionId,
      prisma.source,
      prisma.target,
      prisma.type,
      prisma.label ?? null,
      prisma.weight,
      prisma.notes ?? null,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: { type?: EdgeType; label?: string; weight?: number; notes?: string }): void {
    if (data.type !== undefined) this.type = data.type;
    if (data.label !== undefined) this.label = data.label;
    if (data.weight !== undefined) {
      if (data.weight < 0) throw new Error('Edge weight must be non-negative');
      this.weight = data.weight;
    }
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.addDomainEvent(new EdgeUpdatedEvent(this.id, this.workflowDefinitionId));
  }

  private validateEdge(): void {
    if (!this.source || !this.target) throw new Error('Edge must have source and target');
    if (this.source === this.target) throw new Error('Edge cannot point to itself (self-referencing edge)');
    if (this.weight < 0) throw new Error('Edge weight must be non-negative');
    if (!this.source.includes('.')) {
      throw new Error(`Invalid source fullId format: ${this.source}. Expected format: "workflowId.nodeId"`);
    }
    if (!this.target.includes('.')) {
      throw new Error(`Invalid target fullId format: ${this.target}. Expected format: "workflowId.nodeId"`);
    }
    const sourceWorkflowId = this.source.split('.')[0];
    const targetWorkflowId = this.target.split('.')[0];
    if (sourceWorkflowId !== targetWorkflowId) {
      throw new Error(
        `Flow-internal edge must connect nodes within the same workflow. Source workflow: ${sourceWorkflowId}, Target workflow: ${targetWorkflowId}`
      );
    }
    if (sourceWorkflowId !== this.workflowDefinitionId) {
      throw new Error(
        `Edge workflow ID (${this.workflowDefinitionId}) does not match source node workflow (${sourceWorkflowId})`
      );
    }
  }

  isRequired(): boolean {
    return this.type === EdgeType.required;
  }

  isOptional(): boolean {
    return this.type === EdgeType.optional;
  }

  getSourceNodeId(): string {
    return this.source.split('.')[1];
  }

  getTargetNodeId(): string {
    return this.target.split('.')[1];
  }

  toPrisma(): Omit<PrismaFlowTemplateEdge, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      workflowDefinitionId: this.workflowDefinitionId,
      source: this.source,
      target: this.target,
      type: this.type,
      label: this.label ?? undefined,
      weight: this.weight,
      notes: this.notes ?? undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return {
      id: this.id,
      workflowDefinitionId: this.workflowDefinitionId,
      source: this.source,
      target: this.target,
      type: this.type,
      label: this.label,
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