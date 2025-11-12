export class EdgeUpdatedEvent {
  public readonly occurredAt: Date;
  public readonly eventType = 'EdgeUpdated';

  constructor(public readonly edgeId: string, public readonly workflowId: string) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      edgeId: this.edgeId,
      workflowId: this.workflowId,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}