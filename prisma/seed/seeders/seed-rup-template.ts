import { PrismaClient } from '@prisma/client';
import { rupTemplateData } from '../data/rup-template.data';

export async function seedRUPTemplate(prisma: PrismaClient): Promise<void> {
  const template = await prisma.rUPTemplate.upsert({
    where: { id: rupTemplateData.id },
    update: {
      name: rupTemplateData.name,
      description: rupTemplateData.description,
      category: rupTemplateData.category,
      status: rupTemplateData.status,
    },
    create: {
      id: rupTemplateData.id,
      name: rupTemplateData.name,
      description: rupTemplateData.description,
      category: rupTemplateData.category,
      status: rupTemplateData.status,
    },
  });
  console.log(`     Template: ${template.name}`);

  for (const wf of rupTemplateData.workflows) {
    await prisma.workflowDefinition.upsert({
      where: { id: wf.id },
      update: {
        name: wf.name,
        code: wf.code,
        phases: wf.phases,
        priority: wf.priority,
        estimatedDuration: wf.estimatedDuration,
        description: wf.description,
      },
      create: {
        id: wf.id,
        rupTemplateId: template.id,
        name: wf.name,
        code: wf.code,
        phases: wf.phases,
        priority: wf.priority,
        estimatedDuration: wf.estimatedDuration,
        description: wf.description,
      },
    });
  }
  console.log(`     Workflows: ${rupTemplateData.workflows.length}`);

  for (const node of rupTemplateData.nodes) {
    await prisma.flowTemplateNode.upsert({
      where: { fullId: node.fullId },
      update: {
        label: node.label,
        description: node.description,
        phase: node.phase,
        priority: node.priority,
        estimatedDuration: node.estimatedDuration,
        positionX: node.positionX,
        positionY: node.positionY,
        completionCondition: node.completionCondition,
      },
      create: {
        id: node.id,
        workflowDefinitionId: node.workflowDefinitionId,
        fullId: node.fullId,
        docTypeId: node.docTypeId,
        label: node.label,
        description: node.description,
        phase: node.phase,
        workflow: node.workflow,
        priority: node.priority,
        estimatedDuration: node.estimatedDuration,
        positionX: node.positionX,
        positionY: node.positionY,
        completionCondition: node.completionCondition,
      },
    });
  }
  console.log(`     Nodes: ${rupTemplateData.nodes.length}`);

  for (const wf of rupTemplateData.workflows) {
    await prisma.flowTemplateEdge.deleteMany({ where: { workflowDefinitionId: wf.id } });
  }
  for (const edge of rupTemplateData.edges) {
    await prisma.flowTemplateEdge.create({
      data: {
        workflowDefinitionId: edge.workflowDefinitionId,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label,
        weight: edge.weight,
      },
    });
  }
  console.log(`     Edges: ${rupTemplateData.edges.length}`);

  await prisma.crossFlowDependency.deleteMany({ where: { rupTemplateId: template.id } });
  for (const dep of rupTemplateData.crossFlowDependencies) {
    await prisma.crossFlowDependency.create({
      data: {
        rupTemplateId: template.id,
        sourceWorkflowId: dep.sourceWorkflowId,
        sourceNodeId: dep.sourceNodeId,
        sourceFullId: dep.sourceFullId,
        targetWorkflowId: dep.targetWorkflowId,
        targetNodeId: dep.targetNodeId,
        targetFullId: dep.targetFullId,
        type: dep.type,
        displayLabel: dep.displayLabel,
        description: dep.description,
        weight: dep.weight,
      },
    });
  }
  console.log(`     Cross-flow dependencies: ${rupTemplateData.crossFlowDependencies.length}`);
}