import { IssueSeverity, IssueType } from '@prisma/client';

export interface ValidationIssueSeedData {
  templateId: string;
  workflowId?: string;
  nodeId?: string;
  severity: IssueSeverity;
  type: IssueType;
  message: string;
  details: any;
  resolvedAt?: Date;
}

export const validationIssuesData: ValidationIssueSeedData[] = [
  {
    templateId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-requirements',
    nodeId: 'node-use-case-spec',
    severity: IssueSeverity.error,
    type: IssueType.phase_invalid,
    message:
      "Node 'Use-Case Specification' has invalid phase 'Construction' for workflow 'Requirements'",
    details: {
      nodeFullId: 'wf-requirements.node-use-case-spec',
      expectedPhases: ['Inception', 'Elaboration'],
      actualPhase: 'Construction',
      suggestion: 'Change phase to Inception or Elaboration',
    },
    resolvedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    templateId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-analysis-design',
    severity: IssueSeverity.warning,
    type: IssueType.circular_dependency,
    message: 'Circular dependency detected in Analysis & Design workflow',
    details: {
      circularPath: [
        'wf-analysis-design.node-sad',
        'wf-analysis-design.node-class-diagram',
        'wf-analysis-design.node-sequence-diagram',
        'wf-analysis-design.node-sad',
      ],
      pathDescription: 'SAD → Class Diagram → Sequence Diagram → SAD',
      suggestion: 'Remove one edge to break the cycle',
    },
    resolvedAt: new Date('2024-01-16T14:20:00Z'),
  },
  {
    templateId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-deployment',
    nodeId: 'node-optional-report',
    severity: IssueSeverity.info,
    type: IssueType.orphaned_node,
    message:
      "Node 'Optional Deployment Report' has no incoming or outgoing edges",
    details: {
      nodeFullId: 'wf-deployment.node-optional-report',
      suggestion: 'Connect to deployment workflow or remove if unused',
    },
  },
  {
    templateId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-test',
    nodeId: 'node-test-plan',
    severity: IssueSeverity.error,
    type: IssueType.missing_doctype,
    message:
      "Node references non-existent DocType 'test_plan_v2'",
    details: {
      nodeFullId: 'wf-test.node-test-plan',
      invalidDocTypeId: 'test_plan_v2',
      availableDocTypes: ['test_plan', 'test_case', 'test_script'],
      suggestion:
        'Update docTypeId to valid DocType or create missing DocType',
    },
    resolvedAt: new Date('2024-01-17T09:15:00Z'),
  },
  {
    templateId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-implementation',
    severity: IssueSeverity.error,
    type: IssueType.invalid_edge,
    message: 'Edge references non-existent target node',
    details: {
      edgeSource: 'wf-implementation.node-source-code',
      edgeTarget: 'wf-implementation.node-deleted-component',
      error: 'Target node does not exist in workflow',
      suggestion: 'Remove edge or restore target node',
    },
    resolvedAt: new Date('2024-01-18T11:45:00Z'),
  },
];