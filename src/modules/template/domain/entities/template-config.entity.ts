import { TemplateConfig as PrismaTemplateConfig } from '@prisma/client';

export class TemplateConfigEntity {
  private constructor(
    public readonly id: string,
    public readonly templateId: string,
    public maxDepth: number,
    public autoValidateOnSave: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static createDefault(templateId: string): TemplateConfigEntity {
    const now = new Date();
    return new TemplateConfigEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      templateId,
      6,
      true,
      now,
      now
    );
  }

  static fromPrisma(prisma: PrismaTemplateConfig): TemplateConfigEntity {
    return new TemplateConfigEntity(
      prisma.id,
      prisma.templateId,
      prisma.maxDepth,
      prisma.autoValidateOnSave,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  update(data: { maxDepth?: number; autoValidateOnSave?: boolean }): void {
    if (data.maxDepth !== undefined) {
      if (data.maxDepth < 1 || data.maxDepth > 100) throw new Error('maxDepth must be between 1 and 100');
      this.maxDepth = data.maxDepth;
    }
    if (data.autoValidateOnSave !== undefined) {
      this.autoValidateOnSave = data.autoValidateOnSave;
    }
    this.updatedAt = new Date();
  }

  toPrisma(): Omit<PrismaTemplateConfig, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      templateId: this.templateId,
      maxDepth: this.maxDepth,
      autoValidateOnSave: this.autoValidateOnSave,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return {
      id: this.id,
      templateId: this.templateId,
      maxDepth: this.maxDepth,
      autoValidateOnSave: this.autoValidateOnSave,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}