import { prisma } from '@/prisma/client';
import { ValidationIssueEntity } from '../domain/entities/validation-issue.entity';
import { IssueSeverity } from '@prisma/client';

export class ValidationIssueRepository {
  async findById(id: string): Promise<ValidationIssueEntity | null> {
    const i = await prisma.validationIssue.findUnique({ where: { id } });
    return i ? ValidationIssueEntity.fromPrisma(i) : null;
  }

  async findByTemplateId(templateId: string): Promise<ValidationIssueEntity[]> {
    const items = await prisma.validationIssue.findMany({
      where: { templateId },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }]
    });
    return items.map(ValidationIssueEntity.fromPrisma);
  }

  async findUnresolvedByTemplate(templateId: string): Promise<ValidationIssueEntity[]> {
    const items = await prisma.validationIssue.findMany({
      where: { templateId, resolvedAt: null },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }]
    });
    return items.map(ValidationIssueEntity.fromPrisma);
  }

  async findErrorsByTemplate(templateId: string): Promise<ValidationIssueEntity[]> {
    const items = await prisma.validationIssue.findMany({
      where: { templateId, severity: IssueSeverity.error, resolvedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    return items.map(ValidationIssueEntity.fromPrisma);
  }

  async save(issue: ValidationIssueEntity): Promise<void> {
    await prisma.validationIssue.upsert({
      where: { id: issue.id },
      create: issue.toPrisma(),
      update: {
        severity: issue.severity,
        type: issue.type,
        message: issue.message,
        details: issue.details,
        resolvedAt: issue.resolvedAt ?? undefined
      }
    });
  }

  async clearUnresolvedByTemplate(templateId: string): Promise<void> {
    await prisma.validationIssue.deleteMany({ where: { templateId, resolvedAt: null } });
  }

  async deleteResolvedByTemplate(templateId: string): Promise<void> {
    await prisma.validationIssue.deleteMany({ where: { templateId, resolvedAt: { not: null } } });
  }

  async countUnresolvedErrors(templateId: string): Promise<number> {
    return prisma.validationIssue.count({
      where: { templateId, severity: IssueSeverity.error, resolvedAt: null }
    });
  }
}