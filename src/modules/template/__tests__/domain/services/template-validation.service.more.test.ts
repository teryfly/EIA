import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateValidationService } from '../../../domain/services/template-validation.service';
import { PhaseValidationService } from '../../../domain/services/phase-validation.service';
import { TemplateRepository } from '../../../repositories/template.repository';
import { ValidationIssueRepository } from '../../../repositories/validation-issue.repository';
import { DocTypeRepository } from '../../../repositories/doc-type.repository';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../../../domain/entities/flow-template-node.entity';
import { Phase } from '@/shared/types/enums';
import { ValidationIssueEntity } from '../../../domain/entities/validation-issue.entity';

describe('TemplateValidationService - additional coverage', () => {
  let templateRepo: any;
  let issueRepo: any;
  let phaseSvc: any;
  let docTypeRepo: any;
  let svc: TemplateValidationService;

  beforeEach(() => {
    templateRepo = { findByIdWithRelations: vi.fn() } as unknown as TemplateRepository;
    issueRepo = {
      clearUnresolvedByTemplate: vi.fn(),
      save: vi.fn(),
      findUnresolvedByTemplate: vi.fn(),
      findById: vi.fn(),
      deleteResolvedByTemplate: vi.fn()
    } as unknown as ValidationIssueRepository;
    phaseSvc = { validateNodePhase: vi.fn() } as unknown as PhaseValidationService;
    docTypeRepo = { exists: vi.fn() } as unknown as DocTypeRepository;
    svc = new TemplateValidationService(templateRepo as any, issueRepo as any, phaseSvc as any, docTypeRepo as any);
  });

  it('validateTemplate persists issues and returns warnings when workflow has no nodes', async () => {
    const wf = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Empty',
      code: 'Empty',
      phases: [Phase.Inception]
    });
    (templateRepo.findByIdWithRelations as any).mockResolvedValue({
      id: 't1',
      workflows: [{ ...wf, nodes: [] }]
    });
    const report = await svc.validateTemplate('t1');
    expect(report.valid).toBe(true); // warnings only path
    expect(issueRepo.clearUnresolvedByTemplate).toHaveBeenCalledWith('t1');
    expect(issueRepo.save).toHaveBeenCalled(); // warning persisted
  });

  it('getActiveIssues delegates to repo', async () => {
    (issueRepo.findUnresolvedByTemplate as any).mockResolvedValue([{} as any]);
    const res = await svc.getActiveIssues('t1');
    expect(res.length).toBe(1);
    expect(issueRepo.findUnresolvedByTemplate).toHaveBeenCalledWith('t1');
  });

  it('resolveIssue throws when not found', async () => {
    (issueRepo.findById as any).mockResolvedValue(null);
    await expect(svc.resolveIssue('x')).rejects.toThrow('Validation issue x not found');
  });

  it('resolveIssue saves when found', async () => {
    const issue = ValidationIssueEntity.createWorkflowEmpty('t1', 'w1', 'W');
    (issueRepo.findById as any).mockResolvedValue(issue);
    await svc.resolveIssue(issue.id);
    expect(issue.isResolved()).toBe(true);
    expect(issueRepo.save).toHaveBeenCalled();
  });

  it('clearResolvedIssues delegates to repo', async () => {
    await svc.clearResolvedIssues('t1');
    expect(issueRepo.deleteResolvedByTemplate).toHaveBeenCalledWith('t1');
  });

  it('validateTemplate with errors persists and returns invalid', async () => {
    const wf = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration]
    });
    const node = FlowTemplateNodeEntity.create({
      workflowDefinitionId: wf.id,
      nodeId: 'n1',
      docTypeId: 'missing',
      label: 'Vision',
      phase: Phase.Construction,
      workflow: 'Requirements',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any
    });
    (templateRepo.findByIdWithRelations as any).mockResolvedValue({
      id: 't1',
      workflows: [{ ...wf, nodes: [node] }]
    });
    (phaseSvc.validateNodePhase as any).mockResolvedValue(
      ValidationIssueEntity.createPhaseInvalid('t1', wf.id, node.id, {
        nodePhase: node.phase,
        allowedPhases: wf.phases,
        nodeName: node.label,
        workflowName: wf.name
      })
    );
    (docTypeRepo.exists as any).mockResolvedValue(false);

    const report = await svc.validateTemplate('t1');
    expect(report.valid).toBe(false);
    expect(report.getErrorCount()).toBeGreaterThanOrEqual(1);
    expect(issueRepo.clearUnresolvedByTemplate).toHaveBeenCalledWith('t1');
    expect(issueRepo.save).toHaveBeenCalled();
  });
});