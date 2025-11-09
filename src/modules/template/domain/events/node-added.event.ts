export class NodeAddedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly nodeId: string,
    public readonly workflowId: string,
    public readonly fullId: string,
    public readonly nodeName: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'NodeAdded',
      nodeId: this.nodeId,
      workflowId: this.workflowId,
      fullId: this.fullId,
      nodeName: this.nodeName,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}