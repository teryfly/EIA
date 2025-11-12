export class WorkflowUpdatedEvent {
  public readonly occurredAt: Date;
  public readonly eventType = 'WorkflowUpdated';

  constructor(
    public readonly workflowId: string,
    public readonly templateId: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      workflowId: this.workflowId,
      templateId: this.templateId,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}