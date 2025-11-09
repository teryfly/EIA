import { prisma } from '@/prisma/client';
import { RUPTemplate } from '../domain/aggregates/rup-template';
import { WorkflowDefinition } from '../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../domain/entities/flow-template-node.entity';
import { TemplateConfigEntity } from '../domain/entities/template-config.entity';
import { TemplateStatus, TemplateCategory } from '@prisma/client';

export class TemplateRepository {
  async findById(id: string): Promise<RUPTemplate | null> {
    const t = await prisma.rUPTemplate.findUnique({ where: { id } });
    return t ? RUPTemplate.fromPrisma(t) : null;
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const t = await prisma.rUPTemplate.findUnique({
      where: { id },
      include: {
        workflows: {
          include: { nodes: true },
          orderBy: { priority: 'asc' }
        }
      }
    });
    if (!t) return null;
    return {
      ...RUPTemplate.fromPrisma(t),
      workflows: t.workflows.map((w) => ({
        ...WorkflowDefinition.fromPrisma(w),
        nodes: w.nodes.map((n) => FlowTemplateNodeEntity.fromPrisma(n))
      }))
    };
  }

  async findAll(filters?: { status?: TemplateStatus; category?: TemplateCategory }): Promise<RUPTemplate[]> {
    const templates = await prisma.rUPTemplate.findMany({
      where: { status: filters?.status, category: filters?.category },
      orderBy: { createdAt: 'desc' }
    });
    return templates.map(RUPTemplate.fromPrisma);
  }

  async save(template: RUPTemplate): Promise<void> {
    await prisma.rUPTemplate.upsert({
      where: { id: template.id },
      create: template.toPrisma(),
      update: {
        name: template.name,
        description: template.description,
        estimatedDuration: template.estimatedDuration,
        status: template.status,
        updatedAt: template.updatedAt
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.rUPTemplate.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.rUPTemplate.count({ where: { id } });
    return count > 0;
  }

  async findByName(name: string): Promise<RUPTemplate[]> {
    const templates = await prisma.rUPTemplate.findMany({
      where: { name: { contains: name, mode: 'insensitive' } }
    });
    return templates.map(RUPTemplate.fromPrisma);
  }

  async getConfig(templateId: string): Promise<TemplateConfigEntity | null> {
    const c = await prisma.templateConfig.findUnique({ where: { templateId } });
    return c ? TemplateConfigEntity.fromPrisma(c) : null;
  }

  async saveConfig(config: TemplateConfigEntity): Promise<void> {
    await prisma.templateConfig.upsert({
      where: { templateId: config.templateId },
      create: config.toPrisma(),
      update: {
        maxDepth: config.maxDepth,
        autoValidateOnSave: config.autoValidateOnSave,
        updatedAt: config.updatedAt
      }
    });
  }

  async countByStatus(status: TemplateStatus): Promise<number> {
    return prisma.rUPTemplate.count({ where: { status } });
  }

  async findPublished(): Promise<RUPTemplate[]> {
    const templates = await prisma.rUPTemplate.findMany({
      where: { status: TemplateStatus.Published },
      orderBy: { name: 'asc' }
    });
    return templates.map(RUPTemplate.fromPrisma);
  }
}