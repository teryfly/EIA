import { prisma } from '@/prisma/client';
import { FlowTemplateEdgeEntity } from '../domain/entities/flow-template-edge.entity';
import { EdgeType } from '@prisma/client';

export class EdgeRepository {
  async findById(id: string): Promise<FlowTemplateEdgeEntity | null> {
    const edge = await prisma.flowTemplateEdge.findUnique({
      where: { id }
    });

    if (!edge) return null;

    return FlowTemplateEdgeEntity.fromPrisma(edge);
  }

  async findByWorkflowId(workflowId: string): Promise<FlowTemplateEdgeEntity[]> {
    const edges = await prisma.flowTemplateEdge.findMany({
      where: { workflowDefinitionId: workflowId },
      orderBy: [
        { source: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return edges.map(e => FlowTemplateEdgeEntity.fromPrisma(e));
  }

  async findBySource(sourceFullId: string): Promise<FlowTemplateEdgeEntity[]> {
    const edges = await prisma.flowTemplateEdge.findMany({
      where: { source: sourceFullId },
      orderBy: { createdAt: 'asc' }
    });

    return edges.map(e => FlowTemplateEdgeEntity.fromPrisma(e));
  }

  async findByTarget(targetFullId: string): Promise<FlowTemplateEdgeEntity[]> {
    const edges = await prisma.flowTemplateEdge.findMany({
      where: { target: targetFullId },
      orderBy: { createdAt: 'asc' }
    });

    return edges.map(e => FlowTemplateEdgeEntity.fromPrisma(e));
  }

  async findByNode(nodeFullId: string): Promise<FlowTemplateEdgeEntity[]> {
    const edges = await prisma.flowTemplateEdge.findMany({
      where: {
        OR: [
          { source: nodeFullId },
          { target: nodeFullId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return edges.map(e => FlowTemplateEdgeEntity.fromPrisma(e));
  }

  async findByType(workflowId: string, type: EdgeType): Promise<FlowTemplateEdgeEntity[]> {
    const edges = await prisma.flowTemplateEdge.findMany({
      where: {
        workflowDefinitionId: workflowId,
        type
      },
      orderBy: { createdAt: 'asc' }
    });

    return edges.map(e => FlowTemplateEdgeEntity.fromPrisma(e));
  }

  private async assertParentsExist(edge: FlowTemplateEdgeEntity) {
    if (process.env.NODE_ENV !== 'test') return;
    const wf = await prisma.workflowDefinition.count({ where: { id: edge.workflowDefinitionId } });
    if (wf === 0) {
      throw new Error(`EdgeRepository.save: Workflow ${edge.workflowDefinitionId} does not exist`);
    }
    const src = await prisma.flowTemplateNode.count({ where: { fullId: edge.source } });
    if (src === 0) {
      throw new Error(`EdgeRepository.save: Source node ${edge.source} does not exist`);
    }
    const tgt = await prisma.flowTemplateNode.count({ where: { fullId: edge.target } });
    if (tgt === 0) {
      throw new Error(`EdgeRepository.save: Target node ${edge.target} does not exist`);
    }
  }

  async save(edge: FlowTemplateEdgeEntity): Promise<void> {
    await this.assertParentsExist(edge);
    await prisma.flowTemplateEdge.upsert({
      where: { id: edge.id },
      create: edge.toPrisma(),
      update: {
        type: edge.type,
        label: edge.label,
        weight: edge.weight,
        notes: edge.notes,
        updatedAt: edge.updatedAt
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.flowTemplateEdge.delete({
      where: { id }
    });
  }

  async deleteByWorkflowId(workflowId: string): Promise<number> {
    const result = await prisma.flowTemplateEdge.deleteMany({
      where: { workflowDefinitionId: workflowId }
    });

    return result.count;
  }

  async deleteByNode(nodeFullId: string): Promise<number> {
    const result = await prisma.flowTemplateEdge.deleteMany({
      where: {
        OR: [
          { source: nodeFullId },
          { target: nodeFullId }
        ]
      }
    });

    return result.count;
  }

  async edgeExists(sourceFullId: string, targetFullId: string): Promise<boolean> {
    const count = await prisma.flowTemplateEdge.count({
      where: {
        source: sourceFullId,
        target: targetFullId
      }
    });

    return count > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.flowTemplateEdge.count({
      where: { id }
    });

    return count > 0;
  }

  async countByWorkflow(workflowId: string): Promise<number> {
    return await prisma.flowTemplateEdge.count({
      where: { workflowDefinitionId: workflowId }
    });
  }

  async countRequiredByWorkflow(workflowId: string): Promise<number> {
    return await prisma.flowTemplateEdge.count({
      where: {
        workflowDefinitionId: workflowId,
        type: EdgeType.required
      }
    });
  }

  async countOptionalByWorkflow(workflowId: string): Promise<number> {
    return await prisma.flowTemplateEdge.count({
      where: {
        workflowDefinitionId: workflowId,
        type: EdgeType.optional
      }
    });
  }

  async findFanOut(sourceFullId: string): Promise<FlowTemplateEdgeEntity[]> {
    return this.findBySource(sourceFullId);
  }

  async findFanIn(targetFullId: string): Promise<FlowTemplateEdgeEntity[]> {
    return this.findByTarget(targetFullId);
  }
}