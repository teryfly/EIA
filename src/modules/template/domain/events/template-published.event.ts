export class TemplatePublishedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly templateId: string,
    public readonly templateName: string
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'TemplatePublished',
      templateId: this.templateId,
      templateName: this.templateName,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}