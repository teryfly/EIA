import { ValidationIssueEntity } from '../entities/validation-issue.entity';
import { ValidationReport } from '../value-objects/validation-report';
import { PhaseValidationService } from './phase-validation.service';
import { TemplateRepository } from '../../repositories/template.repository';
import { ValidationIssueRepository } from '../../repositories/validation-issue.repository';
import { DocTypeRepository } from '../../repositories/doc-type.repository';
import { WorkflowDefinition } from '../aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../entities/flow-template-node.entity';

export class TemplateValidationService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly validationIssueRepository: ValidationIssueRepository,
    private readonly phaseValidationService: PhaseValidationService,
    private readonly docTypeRepository: DocTypeRepository
  ) {}

  async validateTemplate(templateId: string): Promise<ValidationReport> {
    const errors: ValidationIssueEntity[] = [];
    const warnings: ValidationIssueEntity[] = [];

    const template: any = await this.templateRepository.findByIdWithRelations(templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);

    if (!template.workflows || template.workflows.length === 0) {
      const issue = ValidationIssueEntity.createWorkflowEmpty(templateId, '', 'Template');
      issue.message = 'Template must have at least one workflow';
      errors.push(issue);
      await this.persistValidationIssues(templateId, [...errors, ...warnings]);
      return ValidationReport.createInvalid(templateId, errors, warnings);
    }

    for (const wf of template.workflows as (WorkflowDefinition & { nodes: FlowTemplateNodeEntity[] })[]) {
      const wfResult = await this.validateWorkflow(template.id, wf);
      errors.push(...wfResult.errors);
      warnings.push(...wfResult.warnings);
    }

    await this.persistValidationIssues(templateId, [...errors, ...warnings]);

    if (errors.length > 0) return ValidationReport.createInvalid(templateId, errors, warnings);
    return ValidationReport.createValid(templateId);
  }

  private async validateWorkflow(
    templateId: string,
    workflow: WorkflowDefinition & { nodes: FlowTemplateNodeEntity[] }
  ): Promise<{ errors: ValidationIssueEntity[]; warnings: ValidationIssueEntity[] }> {
    const errors: ValidationIssueEntity[] = [];
    const warnings: ValidationIssueEntity[] = [];

    if (!workflow.nodes || workflow.nodes.length === 0) {
      warnings.push(ValidationIssueEntity.createWorkflowEmpty(templateId, workflow.id, workflow.name));
      return { errors, warnings };
    }

    for (const node of workflow.nodes) {
      const phaseIssue = await this.phaseValidationService.validateNodePhase(templateId, workflow, node);
      if (phaseIssue) errors.push(phaseIssue);

      const docTypeExists = await this.docTypeRepository.exists(node.docTypeId);
      if (!docTypeExists) {
        errors.push(ValidationIssueEntity.createMissingDocType(templateId, workflow.id, node.id, node.docTypeId));
      }
    }

    return { errors, warnings };
  }

  private async persistValidationIssues(templateId: string, issues: ValidationIssueEntity[]): Promise<void> {
    await this.validationIssueRepository.clearUnresolvedByTemplate(templateId);
    for (const issue of issues) {
      await this.validationIssueRepository.save(issue);
    }
  }

  async getActiveIssues(templateId: string): Promise<ValidationIssueEntity[]> {
    return this.validationIssueRepository.findUnresolvedByTemplate(templateId);
  }

  async resolveIssue(issueId: string): Promise<void> {
    const issue = await this.validationIssueRepository.findById(issueId);
    if (!issue) throw new Error(`Validation issue ${issueId} not found`);
    issue.resolve();
    await this.validationIssueRepository.save(issue);
  }

  async clearResolvedIssues(templateId: string): Promise<void> {
    await this.validationIssueRepository.deleteResolvedByTemplate(templateId);
  }
}