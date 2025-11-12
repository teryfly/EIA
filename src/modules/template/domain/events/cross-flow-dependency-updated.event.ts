export class CrossFlowDependencyUpdatedEvent {
  public readonly occurredAt: Date;
  public readonly eventType = 'CrossFlowDependencyUpdated';

  constructor(public readonly dependencyId: string, public readonly templateId: string) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      dependencyId: this.dependencyId,
      templateId: this.templateId,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}