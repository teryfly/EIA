import { EdgeType } from '@prisma/client';

export class EdgeAddedEvent {
  public readonly occurredAt: Date;
  public readonly eventType = 'EdgeAdded';

  constructor(
    public readonly edgeId: string,
    public readonly workflowId: string,
    public readonly source: string,
    public readonly target: string,
    public readonly type: EdgeType
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      edgeId: this.edgeId,
      workflowId: this.workflowId,
      source: this.source,
      target: this.target,
      type: this.type,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}