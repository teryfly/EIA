import { EdgeType } from '@prisma/client';

export class CrossFlowDependencyAddedEvent {
  public readonly occurredAt: Date;
  public readonly eventType = 'CrossFlowDependencyAdded';

  constructor(
    public readonly dependencyId: string,
    public readonly templateId: string,
    public readonly sourceFullId: string,
    public readonly targetFullId: string,
    public readonly type: EdgeType
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      dependencyId: this.dependencyId,
      templateId: this.templateId,
      sourceFullId: this.sourceFullId,
      targetFullId: this.targetFullId,
      type: this.type,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}