import { FlowTemplateNode as PrismaFlowTemplateNode } from '@prisma/client';
import { Phase } from '@/shared/types/enums';
import { CompletionCondition } from '@/shared/types/value-objects/completion-condition';
import { NodeAddedEvent, NodeUpdatedEvent } from '../events';

export class FlowTemplateNodeEntity {
  private domainEvents: any[] = [];

  private constructor(
    public readonly id: string,
    public readonly workflowDefinitionId: string,
    public readonly fullId: string,
    public docTypeId: string,
    public label: string,
    public description: string | null,
    public phase: Phase,
    public workflow: string,
    public priority: number,
    public estimatedDuration: string | null,
    public positionX: number,
    public positionY: number,
    public completionCondition: CompletionCondition,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    workflowDefinitionId: string;
    nodeId: string;
    docTypeId: string;
    label: string;
    description?: string;
    phase: Phase;
    workflow: string;
    priority?: number;
    estimatedDuration?: string;
    positionX: number;
    positionY: number;
    completionCondition: CompletionCondition;
  }): FlowTemplateNodeEntity {
    const now = new Date();
    const fullId = `${data.workflowDefinitionId}.${data.nodeId}`;
    if (!data.label || data.label.trim().length === 0) {
      throw new Error('Node label cannot be empty');
    }
    const node = new FlowTemplateNodeEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      data.workflowDefinitionId,
      fullId,
      data.docTypeId,
      data.label,
      data.description ?? null,
      data.phase,
      data.workflow,
      data.priority ?? 0,
      data.estimatedDuration ?? null,
      data.positionX,
      data.positionY,
      data.completionCondition,
      now,
      now
    );
    node.addDomainEvent(new NodeAddedEvent(node.id, node.workflowDefinitionId, node.fullId, node.label));
    return node;
  }

  static fromPrisma(prisma: PrismaFlowTemplateNode): FlowTemplateNodeEntity {
    return new FlowTemplateNodeEntity(
      prisma.id,
      prisma.workflowDefinitionId,
      prisma.fullId,
      prisma.docTypeId,
      prisma.label,
      prisma.description,
      prisma.phase as Phase,
      prisma.workflow,
      prisma.priority,
      prisma.estimatedDuration,
      prisma.positionX,
      prisma.positionY,
      prisma.completionCondition as unknown as CompletionCondition,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: {
    label?: string;
    description?: string;
    phase?: Phase;
    priority?: number;
    estimatedDuration?: string;
    positionX?: number;
    positionY?: number;
    completionCondition?: CompletionCondition;
  }): void {
    if (data.label !== undefined) {
      if (!data.label || data.label.trim().length === 0) {
        throw new Error('Node label cannot be empty');
      }
      this.label = data.label;
    }
    if (data.description !== undefined) this.description = data.description;
    if (data.phase !== undefined) this.phase = data.phase;
    if (data.priority !== undefined) {
      if (data.priority < 0) throw new Error('Priority must be non-negative');
      this.priority = data.priority;
    }
    if (data.estimatedDuration !== undefined) this.estimatedDuration = data.estimatedDuration;
    if (data.positionX !== undefined) this.positionX = data.positionX;
    if (data.positionY !== undefined) this.positionY = data.positionY;
    if (data.completionCondition !== undefined) {
      this.completionCondition = data.completionCondition;
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new NodeUpdatedEvent(this.id, this.workflowDefinitionId, this.fullId));
  }

  toPrisma(): Omit<PrismaFlowTemplateNode, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      workflowDefinitionId: this.workflowDefinitionId,
      fullId: this.fullId,
      docTypeId: this.docTypeId,
      label: this.label,
      description: this.description,
      phase: this.phase,
      workflow: this.workflow,
      priority: this.priority,
      estimatedDuration: this.estimatedDuration,
      positionX: this.positionX,
      positionY: this.positionY,
      completionCondition: this.completionCondition as any,
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