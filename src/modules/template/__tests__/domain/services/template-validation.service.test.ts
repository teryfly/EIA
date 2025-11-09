import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateValidationService } from '../../../domain/services/template-validation.service';
import { PhaseValidationService } from '../../../domain/services/phase-validation.service';
import { TemplateRepository } from '../../../repositories/template.repository';
import { ValidationIssueRepository } from '../../../repositories/validation-issue.repository';
import { DocTypeRepository } from '../../../repositories/doc-type.repository';
import { WorkflowDefinition } from '../../../domain/aggregates/workflow-definition';
import { FlowTemplateNodeEntity } from '../../../domain/entities/flow-template-node.entity';
import { Phase } from '@/shared/types/enums';

describe('TemplateValidationService', () => {
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
      findUnresolvedByTemplate: vi.fn()
    } as unknown as ValidationIssueRepository;
    phaseSvc = { validateNodePhase: vi.fn() } as unknown as PhaseValidationService;
    docTypeRepo = { exists: vi.fn() } as unknown as DocTypeRepository;
    svc = new TemplateValidationService(templateRepo as any, issueRepo as any, phaseSvc as any, docTypeRepo as any);
  });

  it('fails when no workflows', async () => {
    (templateRepo.findByIdWithRelations as any).mockResolvedValue({ id: 't1', workflows: [] });
    const report = await svc.validateTemplate('t1');
    expect(report.valid).toBe(false);
    expect(report.getErrorCount()).toBe(1);
  });

  it('validates nodes and doctypes', async () => {
    const wf = WorkflowDefinition.create({
      rupTemplateId: 't1',
      name: 'Req',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration]
    });
    const node = FlowTemplateNodeEntity.create({
      workflowDefinitionId: wf.id,
      nodeId: 'n1',
      docTypeId: 'vision',
      label: 'Vision',
      phase: Phase.Inception,
      workflow: 'Requirements',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any
    });
    (templateRepo.findByIdWithRelations as any).mockResolvedValue({
      ...({} as any),
      id: 't1',
      workflows: [{ ...wf, nodes: [node] }]
    });
    (phaseSvc.validateNodePhase as any).mockResolvedValue(null);
    (docTypeRepo.exists as any).mockResolvedValue(true);

    const report = await svc.validateTemplate('t1');
    expect(report.valid).toBe(true);
    expect(report.getErrorCount()).toBe(0);
  });

  it('captures missing doctypes as errors', async () => {
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
      phase: Phase.Inception,
      workflow: 'Requirements',
      positionX: 0,
      positionY: 0,
      completionCondition: { type: 'ManualConfirmCondition' } as any
    });
    (templateRepo.findByIdWithRelations as any).mockResolvedValue({
      ...({} as any),
      id: 't1',
      workflows: [{ ...wf, nodes: [node] }]
    });
    (phaseSvc.validateNodePhase as any).mockResolvedValue(null);
    (docTypeRepo.exists as any).mockResolvedValue(false);

    const report = await svc.validateTemplate('t1');
    expect(report.valid).toBe(false);
    expect(report.getErrorCount()).toBe(1);
  });
});