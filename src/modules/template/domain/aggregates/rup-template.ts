import { RUPTemplate as PrismaRUPTemplate, TemplateCategory, TemplateStatus } from '@prisma/client';
import { ValidationReport } from '../value-objects/validation-report';
import { TemplateCreatedEvent, TemplatePublishedEvent, TemplateArchivedEvent } from '../events';

export class RUPTemplate {
  private domainEvents: any[] = [];

  private constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public category: TemplateCategory,
    public estimatedDuration: string | null,
    public status: TemplateStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    name: string;
    description?: string;
    category: TemplateCategory;
    estimatedDuration?: string;
  }): RUPTemplate {
    const now = new Date();
    const template = new RUPTemplate(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      data.name,
      data.description ?? null,
      data.category,
      data.estimatedDuration ?? null,
      TemplateStatus.Draft,
      now,
      now
    );
    template.addDomainEvent(new TemplateCreatedEvent(template.id, template.name, template.category));
    return template;
  }

  static fromPrisma(prisma: PrismaRUPTemplate): RUPTemplate {
    return new RUPTemplate(
      prisma.id,
      prisma.name,
      prisma.description,
      prisma.category,
      prisma.estimatedDuration,
      prisma.status,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: { name?: string; description?: string; estimatedDuration?: string }): void {
    if (this.status === TemplateStatus.Published && this.category === TemplateCategory.Standard) {
      throw new Error('Cannot update published standard templates');
    }
    if (data.name !== undefined) {
      this.validateName(data.name);
      this.name = data.name;
    }
    if (data.description !== undefined) this.description = data.description;
    if (data.estimatedDuration !== undefined) this.estimatedDuration = data.estimatedDuration;
    this.updatedAt = new Date();
  }

  publish(validationReport: ValidationReport): void {
    if (!validationReport.valid) throw new Error('Cannot publish template with validation errors');
    if (this.status === TemplateStatus.Published) throw new Error('Template is already published');
    this.status = TemplateStatus.Published;
    this.updatedAt = new Date();
    this.addDomainEvent(new TemplatePublishedEvent(this.id, this.name));
  }

  archive(): void {
    if (this.category === TemplateCategory.Standard) throw new Error('Cannot archive standard templates');
    if (this.status === TemplateStatus.Archived) throw new Error('Template is already archived');
    this.status = TemplateStatus.Archived;
    this.updatedAt = new Date();
    this.addDomainEvent(new TemplateArchivedEvent(this.id, this.name));
  }

  restore(): void {
    if (this.status !== TemplateStatus.Archived) throw new Error('Can only restore archived templates');
    this.status = TemplateStatus.Draft;
    this.updatedAt = new Date();
  }

  markValidationFailed(): void {
    this.status = TemplateStatus.ValidationFailed;
    this.updatedAt = new Date();
  }

  resetToDraft(): void {
    if (this.status !== TemplateStatus.ValidationFailed) {
      throw new Error('Can only reset validation-failed templates');
    }
    this.status = TemplateStatus.Draft;
    this.updatedAt = new Date();
  }

  canEdit(): boolean {
    if (this.category === TemplateCategory.Standard && this.status === TemplateStatus.Published) {
      return false;
    }
    return this.status !== TemplateStatus.Archived;
  }

  canDelete(): boolean {
    return this.category !== TemplateCategory.Standard && this.status === TemplateStatus.Draft;
  }

  canPublish(): boolean {
    return this.status === TemplateStatus.Draft;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) throw new Error('Template name cannot be empty');
    if (name.length < 2 || name.length > 100) {
      throw new Error('Template name must be between 2 and 100 characters');
    }
  }

  toPrisma(): Omit<PrismaRUPTemplate, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      estimatedDuration: this.estimatedDuration,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}