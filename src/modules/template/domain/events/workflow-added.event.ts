export class WorkflowAddedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly workflowId: string,
    public readonly templateId: string,
    public readonly workflowName: string,
    public readonly workflowCode: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'WorkflowAdded',
      workflowId: this.workflowId,
      templateId: this.templateId,
      workflowName: this.workflowName,
      workflowCode: this.workflowCode,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}