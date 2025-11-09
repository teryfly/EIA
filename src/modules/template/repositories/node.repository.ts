import { prisma } from '@/prisma/client';
import { FlowTemplateNodeEntity } from '../domain/entities/flow-template-node.entity';

export class NodeRepository {
  async findById(id: string): Promise<FlowTemplateNodeEntity | null> {
    const n = await prisma.flowTemplateNode.findUnique({ where: { id } });
    return n ? FlowTemplateNodeEntity.fromPrisma(n) : null;
  }

  async findByFullId(fullId: string): Promise<FlowTemplateNodeEntity | null> {
    const n = await prisma.flowTemplateNode.findUnique({ where: { fullId } });
    return n ? FlowTemplateNodeEntity.fromPrisma(n) : null;
  }

  async findByWorkflowId(workflowId: string): Promise<FlowTemplateNodeEntity[]> {
    const nodes = await prisma.flowTemplateNode.findMany({
      where: { workflowDefinitionId: workflowId },
      orderBy: { priority: 'asc' }
    });
    return nodes.map(FlowTemplateNodeEntity.fromPrisma);
  }

  async save(node: FlowTemplateNodeEntity): Promise<void> {
    await prisma.flowTemplateNode.upsert({
      where: { id: node.id },
      create: node.toPrisma(),
      update: {
        label: node.label,
        description: node.description,
        phase: node.phase,
        priority: node.priority,
        estimatedDuration: node.estimatedDuration,
        positionX: node.positionX,
        positionY: node.positionY,
        completionCondition: node.completionCondition as any,
        updatedAt: node.updatedAt
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.flowTemplateNode.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const c = await prisma.flowTemplateNode.count({ where: { id } });
    return c > 0;
  }

  async fullIdExists(fullId: string): Promise<boolean> {
    const c = await prisma.flowTemplateNode.count({ where: { fullId } });
    return c > 0;
  }
}