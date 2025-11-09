import { RUPTemplate } from '../domain/aggregates/rup-template';
import { WorkflowDefinition } from '../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../domain/entities/flow-template-node.entity';
import { TemplateConfigEntity } from '../domain/entities/template-config.entity';
import { TemplateRepository } from '../repositories/template.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { NodeRepository } from '../repositories/node.repository';
import { TemplateCategory } from '@prisma/client';

export interface CloneTemplateInput {
  sourceTemplateId: string;
  newName: string;
  newDescription?: string;
  category?: TemplateCategory;
}
export interface CloneTemplateOutput {
  templateId: string;
  name: string;
  workflowCount: number;
  nodeCount: number;
}

export class CloneTemplateUseCase {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(input: CloneTemplateInput): Promise<CloneTemplateOutput> {
    const source: any = await this.templateRepository.findByIdWithRelations(input.sourceTemplateId);
    if (!source) throw new Error(`Source template ${input.sourceTemplateId} not found`);

    const dup = await this.templateRepository.findByName(input.newName);
    if (dup.length > 0) throw new Error(`Template with name "${input.newName}" already exists`);

    const newTemplate = RUPTemplate.create({
      name: input.newName,
      description: input.newDescription ?? source.description ?? undefined,
      category: input.category ?? TemplateCategory.Custom,
      estimatedDuration: source.estimatedDuration ?? undefined
    });

    const sourceConfig = await this.templateRepository.getConfig(input.sourceTemplateId);
    const newConfig = TemplateConfigEntity.createDefault(newTemplate.id);
    if (sourceConfig) {
      newConfig.update({ maxDepth: sourceConfig.maxDepth, autoValidateOnSave: sourceConfig.autoValidateOnSave });
    }

    await this.templateRepository.save(newTemplate);
    await this.templateRepository.saveConfig(newConfig);

    let totalNodes = 0;
    for (const wf of source.workflows as any[]) {
      const newWf = WorkflowDefinition.create({
        rupTemplateId: newTemplate.id,
        name: wf.name,
        code: wf.code,
        priority: wf.priority,
        estimatedDuration: wf.estimatedDuration ?? undefined,
        description: wf.description ?? undefined,
        phases: wf.phases
      });
      await this.workflowRepository.save(newWf);

      for (const node of wf.nodes) {
        const newNode = FlowTemplateNodeEntity.create({
          workflowDefinitionId: newWf.id,
          nodeId: node.fullId.split('.')[1],
          docTypeId: node.docTypeId,
          label: node.label,
          description: node.description ?? undefined,
          phase: node.phase,
          workflow: newWf.name,
          priority: node.priority,
          estimatedDuration: node.estimatedDuration ?? undefined,
          positionX: node.positionX,
          positionY: node.positionY,
          completionCondition: node.completionCondition
        });
        await this.nodeRepository.save(newNode);
        totalNodes++;
      }
    }

    return { templateId: newTemplate.id, name: newTemplate.name, workflowCount: source.workflows.length, nodeCount: totalNodes };
  }
}