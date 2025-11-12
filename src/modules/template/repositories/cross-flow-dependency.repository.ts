import { prisma } from '@/prisma/client';
import { CrossFlowDependencyEntity } from '../domain/entities/cross-flow-dependency.entity';
import { EdgeType } from '@prisma/client';

export class CrossFlowDependencyRepository {
  async findById(id: string): Promise<CrossFlowDependencyEntity | null> {
    const dep = await prisma.crossFlowDependency.findUnique({
      where: { id }
    });

    if (!dep) return null;

    return CrossFlowDependencyEntity.fromPrisma(dep);
  }

  async findByTemplateId(templateId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: { rupTemplateId: templateId },
      orderBy: [
        { sourceWorkflowId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findBySourceWorkflow(sourceWorkflowId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: { sourceWorkflowId },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findByTargetWorkflow(targetWorkflowId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: { targetWorkflowId },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findBySourceNode(sourceFullId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: { sourceFullId },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findByTargetNode(targetFullId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: { targetFullId },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findByNode(nodeFullId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: {
        OR: [
          { sourceFullId: nodeFullId },
          { targetFullId: nodeFullId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findByWorkflow(workflowId: string): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: {
        OR: [
          { sourceWorkflowId: workflowId },
          { targetWorkflowId: workflowId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findByType(templateId: string, type: EdgeType): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: {
        rupTemplateId: templateId,
        type
      },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async findBetweenWorkflows(
    sourceWorkflowId: string,
    targetWorkflowId: string
  ): Promise<CrossFlowDependencyEntity[]> {
    const deps = await prisma.crossFlowDependency.findMany({
      where: {
        sourceWorkflowId,
        targetWorkflowId
      },
      orderBy: { createdAt: 'asc' }
    });

    return deps.map(d => CrossFlowDependencyEntity.fromPrisma(d));
  }

  async save(dependency: CrossFlowDependencyEntity): Promise<void> {
    await prisma.crossFlowDependency.upsert({
      where: { id: dependency.id },
      create: dependency.toPrisma(),
      update: {
        type: dependency.type,
        displayLabel: dependency.displayLabel,
        description: dependency.description,
        weight: dependency.weight,
        notes: dependency.notes,
        updatedAt: dependency.updatedAt
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.crossFlowDependency.delete({
      where: { id }
    });
  }

  async deleteByTemplateId(templateId: string): Promise<number> {
    const result = await prisma.crossFlowDependency.deleteMany({
      where: { rupTemplateId: templateId }
    });

    return result.count;
  }

  async deleteByWorkflow(workflowId: string): Promise<number> {
    const result = await prisma.crossFlowDependency.deleteMany({
      where: {
        OR: [
          { sourceWorkflowId: workflowId },
          { targetWorkflowId: workflowId }
        ]
      }
    });

    return result.count;
  }

  async deleteByNode(nodeFullId: string): Promise<number> {
    const result = await prisma.crossFlowDependency.deleteMany({
      where: {
        OR: [
          { sourceFullId: nodeFullId },
          { targetFullId: nodeFullId }
        ]
      }
    });

    return result.count;
  }

  async dependencyExists(sourceFullId: string, targetFullId: string): Promise<boolean> {
    const count = await prisma.crossFlowDependency.count({
      where: {
        sourceFullId,
        targetFullId
      }
    });

    return count > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.crossFlowDependency.count({
      where: { id }
    });

    return count > 0;
  }

  async countByTemplate(templateId: string): Promise<number> {
    return await prisma.crossFlowDependency.count({
      where: { rupTemplateId: templateId }
    });
  }

  async countRequiredByTemplate(templateId: string): Promise<number> {
    return await prisma.crossFlowDependency.count({
      where: {
        rupTemplateId: templateId,
        type: EdgeType.required
      }
    });
  }

  async countOptionalByTemplate(templateId: string): Promise<number> {
    return await prisma.crossFlowDependency.count({
      where: {
        rupTemplateId: templateId,
        type: EdgeType.optional
      }
    });
  }
}