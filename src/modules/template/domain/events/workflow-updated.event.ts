export class WorkflowUpdatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly workflowId: string,
    public readonly templateId: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'WorkflowUpdated',
      workflowId: this.workflowId,
      templateId: this.templateId,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}