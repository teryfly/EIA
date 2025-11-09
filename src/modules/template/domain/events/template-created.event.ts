import { TemplateCategory } from '@prisma/client';

export class TemplateCreatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly templateId: string,
    public readonly templateName: string,
    public readonly category: TemplateCategory
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: 'TemplateCreated',
      templateId: this.templateId,
      templateName: this.templateName,
      category: this.category,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}