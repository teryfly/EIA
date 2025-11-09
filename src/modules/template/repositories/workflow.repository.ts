import { prisma } from '@/prisma/client';
import { WorkflowDefinition } from '../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../domain/entities/flow-template-node.entity';

export class WorkflowRepository {
  async findById(id: string): Promise<WorkflowDefinition | null> {
    const w = await prisma.workflowDefinition.findUnique({ where: { id } });
    return w ? WorkflowDefinition.fromPrisma(w) : null;
  }

  async findByIdWithNodes(id: string): Promise<any | null> {
    const w = await prisma.workflowDefinition.findUnique({
      where: { id },
      include: { nodes: { orderBy: { priority: 'asc' } } }
    });
    if (!w) return null;
    return {
      ...WorkflowDefinition.fromPrisma(w),
      nodes: w.nodes.map(FlowTemplateNodeEntity.fromPrisma)
    };
  }

  async findByTemplateId(templateId: string): Promise<WorkflowDefinition[]> {
    const ws = await prisma.workflowDefinition.findMany({
      where: { rupTemplateId: templateId },
      orderBy: { priority: 'asc' }
    });
    return ws.map(WorkflowDefinition.fromPrisma);
  }

  async save(workflow: WorkflowDefinition): Promise<void> {
    await prisma.workflowDefinition.upsert({
      where: { id: workflow.id },
      create: workflow.toPrisma(),
      update: {
        name: workflow.name,
        description: workflow.description,
        estimatedDuration: workflow.estimatedDuration,
        priority: workflow.priority,
        phases: workflow.phases,
        updatedAt: workflow.updatedAt
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.workflowDefinition.delete({ where: { id } });
  }

  async codeExistsInTemplate(templateId: string, code: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.workflowDefinition.count({
      where: { rupTemplateId: templateId, code, id: excludeId ? { not: excludeId } : undefined }
    });
    return count > 0;
  }

  async countNodes(workflowId: string): Promise<number> {
    return prisma.flowTemplateNode.count({ where: { workflowDefinitionId: workflowId } });
  }

  async exists(id: string): Promise<boolean> {
    const c = await prisma.workflowDefinition.count({ where: { id } });
    return c > 0;
  }
}