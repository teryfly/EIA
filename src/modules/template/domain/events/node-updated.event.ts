export class NodeUpdatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly nodeId: string,
    public readonly workflowId: string,
    public readonly fullId: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'NodeUpdated',
      nodeId: this.nodeId,
      workflowId: this.workflowId,
      fullId: this.fullId,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}