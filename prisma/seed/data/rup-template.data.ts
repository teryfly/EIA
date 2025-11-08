import {
  Phase,
  EdgeType,
  TemplateCategory,
  TemplateStatus,
} from '@prisma/client';

export interface WorkflowSeedData {
  id: string;
  name: string;
  code: string;
  phases: Phase[];
  priority: number;
  estimatedDuration?: string;
  description?: string;
}

export interface NodeSeedData {
  id: string;
  workflowDefinitionId: string;
  fullId: string;
  docTypeId: string;
  label: string;
  description?: string;
  phase: Phase;
  workflow: string;
  priority: number;
  estimatedDuration?: string;
  positionX: number;
  positionY: number;
  completionCondition: any;
}

export interface EdgeSeedData {
  workflowDefinitionId: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  weight: number;
}

export interface CrossFlowDependencySeedData {
  sourceWorkflowId: string;
  sourceNodeId: string;
  sourceFullId: string;
  targetWorkflowId: string;
  targetNodeId: string;
  targetFullId: string;
  type: EdgeType;
  displayLabel?: string;
  description?: string;
  weight: number;
}

export interface RUPTemplateSeedData {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  status: TemplateStatus;
  workflows: WorkflowSeedData[];
  nodes: NodeSeedData[];
  edges: EdgeSeedData[];
  crossFlowDependencies: CrossFlowDependencySeedData[];
}

export const rupTemplateData: RUPTemplateSeedData = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Standard RUP Template v1.0',
  description:
    'Minimal functional RUP template subset to enable end-to-end seeding',
  category: TemplateCategory.Standard,
  status: TemplateStatus.Published,
  workflows: [
    {
      id: 'wf-business-modeling',
      name: 'Business Modeling',
      code: 'Business Modeling',
      phases: [Phase.Inception, Phase.Elaboration],
      priority: 1,
      estimatedDuration: '2-4 weeks',
      description: 'Understand business context and processes',
    },
    {
      id: 'wf-requirements',
      name: 'Requirements',
      code: 'Requirements',
      phases: [Phase.Inception, Phase.Elaboration],
      priority: 2,
      estimatedDuration: '4-8 weeks',
      description: 'Capture and manage system requirements',
    },
    {
      id: 'wf-analysis-design',
      name: 'Analysis & Design',
      code: 'Analysis & Design',
      phases: [Phase.Elaboration, Phase.Construction],
      priority: 3,
      estimatedDuration: '8-16 weeks',
      description: 'Design system architecture and components',
    },
    {
      id: 'wf-implementation',
      name: 'Implementation',
      code: 'Implementation',
      phases: [Phase.Construction],
      priority: 4,
      estimatedDuration: '8-20 weeks',
      description: 'Implement the system',
    },
    {
      id: 'wf-test',
      name: 'Test',
      code: 'Test',
      phases: [Phase.Construction, Phase.Transition],
      priority: 5,
      estimatedDuration: '4-12 weeks',
      description: 'Verify quality and readiness',
    },
    {
      id: 'wf-deployment',
      name: 'Deployment',
      code: 'Deployment',
      phases: [Phase.Transition],
      priority: 6,
      estimatedDuration: '2-4 weeks',
      description: 'Deliver system to users',
    },
    {
      id: 'wf-config-change',
      name: 'Configuration & Change Management',
      code: 'Configuration & Change Management',
      phases: [Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition],
      priority: 7,
      estimatedDuration: 'Continuous',
      description: 'Manage changes and baselines',
    },
    {
      id: 'wf-project-management',
      name: 'Project Management',
      code: 'Project Management',
      phases: [Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition],
      priority: 8,
      estimatedDuration: 'Continuous',
      description: 'Plan and control the project',
    },
    {
      id: 'wf-environment',
      name: 'Environment',
      code: 'Environment',
      phases: [Phase.Inception, Phase.Elaboration, Phase.Construction, Phase.Transition],
      priority: 9,
      estimatedDuration: 'Continuous',
      description: 'Supportive process and tools',
    },
  ],
  nodes: [
    {
      id: 'node-biz-vision',
      workflowDefinitionId: 'wf-business-modeling',
      fullId: 'wf-business-modeling.node-biz-vision',
      docTypeId: 'business_vision',
      label: 'Business Vision',
      description: 'Define business opportunity and goals',
      phase: Phase.Inception,
      workflow: 'Business Modeling',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 100,
      positionY: 100,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-vision',
      workflowDefinitionId: 'wf-requirements',
      fullId: 'wf-requirements.node-vision',
      docTypeId: 'vision',
      label: 'Vision Document',
      description: 'Product vision and stakeholders',
      phase: Phase.Inception,
      workflow: 'Requirements',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 400,
      positionY: 100,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-uc-model',
      workflowDefinitionId: 'wf-requirements',
      fullId: 'wf-requirements.node-uc-model',
      docTypeId: 'use_case_model',
      label: 'Use-Case Model',
      description: 'Actors and use cases',
      phase: Phase.Elaboration,
      workflow: 'Requirements',
      priority: 2,
      estimatedDuration: '2w',
      positionX: 400,
      positionY: 300,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-sad',
      workflowDefinitionId: 'wf-analysis-design',
      fullId: 'wf-analysis-design.node-sad',
      docTypeId: 'software_architecture_document',
      label: 'Architecture',
      description: 'Architecture definition',
      phase: Phase.Elaboration,
      workflow: 'Analysis & Design',
      priority: 1,
      estimatedDuration: '2w',
      positionX: 700,
      positionY: 200,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-impl-model',
      workflowDefinitionId: 'wf-implementation',
      fullId: 'wf-implementation.node-impl-model',
      docTypeId: 'implementation_model',
      label: 'Implementation Model',
      description: 'Code structure and mapping',
      phase: Phase.Construction,
      workflow: 'Implementation',
      priority: 1,
      estimatedDuration: '2w',
      positionX: 1000,
      positionY: 200,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-test-plan',
      workflowDefinitionId: 'wf-test',
      fullId: 'wf-test.node-test-plan',
      docTypeId: 'test_plan',
      label: 'Test Plan',
      description: 'Testing strategy and scope',
      phase: Phase.Construction,
      workflow: 'Test',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 1300,
      positionY: 200,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-deploy-plan',
      workflowDefinitionId: 'wf-deployment',
      fullId: 'wf-deployment.node-deploy-plan',
      docTypeId: 'deployment_plan',
      label: 'Deployment Plan',
      description: 'Deployment to environments',
      phase: Phase.Transition,
      workflow: 'Deployment',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 1600,
      positionY: 200,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-project-plan',
      workflowDefinitionId: 'wf-project-management',
      fullId: 'wf-project-management.node-project-plan',
      docTypeId: 'project_plan',
      label: 'Project Plan',
      description: 'Project scope and schedule',
      phase: Phase.Inception,
      workflow: 'Project Management',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 400,
      positionY: -50,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-cm-plan',
      workflowDefinitionId: 'wf-config-change',
      fullId: 'wf-config-change.node-cm-plan',
      docTypeId: 'cm_plan',
      label: 'CM Plan',
      description: 'Configuration & change mgmt',
      phase: Phase.Inception,
      workflow: 'Configuration & Change Management',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 250,
      positionY: -50,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
    {
      id: 'node-dev-case',
      workflowDefinitionId: 'wf-environment',
      fullId: 'wf-environment.node-dev-case',
      docTypeId: 'development_case',
      label: 'Development Case',
      description: 'Process tailoring and tools',
      phase: Phase.Inception,
      workflow: 'Environment',
      priority: 1,
      estimatedDuration: '1w',
      positionX: 550,
      positionY: -50,
      completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
    },
  ],
  edges: [
    {
      workflowDefinitionId: 'wf-requirements',
      source: 'wf-requirements.node-vision',
      target: 'wf-requirements.node-uc-model',
      type: EdgeType.required,
      label: 'Vision informs UC Model',
      weight: 1,
    },
  ],
  crossFlowDependencies: [
    {
      sourceWorkflowId: 'wf-business-modeling',
      sourceNodeId: 'node-biz-vision',
      sourceFullId: 'wf-business-modeling.node-biz-vision',
      targetWorkflowId: 'wf-requirements',
      targetNodeId: 'node-vision',
      targetFullId: 'wf-requirements.node-vision',
      type: EdgeType.required,
      displayLabel: 'Business Vision → Vision',
      description: 'Business context informs product vision',
      weight: 1,
    },
    {
      sourceWorkflowId: 'wf-requirements',
      sourceNodeId: 'node-uc-model',
      sourceFullId: 'wf-requirements.node-uc-model',
      targetWorkflowId: 'wf-analysis-design',
      targetNodeId: 'node-sad',
      targetFullId: 'wf-analysis-design.node-sad',
      type: EdgeType.required,
      displayLabel: 'Use-Case Model → Architecture',
      description: 'Behavior informs architecture',
      weight: 1,
    },
    {
      sourceWorkflowId: 'wf-analysis-design',
      sourceNodeId: 'node-sad',
      sourceFullId: 'wf-analysis-design.node-sad',
      targetWorkflowId: 'wf-implementation',
      targetNodeId: 'node-impl-model',
      targetFullId: 'wf-implementation.node-impl-model',
      type: EdgeType.required,
      displayLabel: 'SAD → Implementation Model',
      description: 'Architecture guides implementation',
      weight: 1,
    },
    {
      sourceWorkflowId: 'wf-requirements',
      sourceNodeId: 'node-vision',
      sourceFullId: 'wf-requirements.node-vision',
      targetWorkflowId: 'wf-test',
      targetNodeId: 'node-test-plan',
      targetFullId: 'wf-test.node-test-plan',
      type: EdgeType.required,
      displayLabel: 'Vision → Test Plan',
      description: 'Goals drive test scope',
      weight: 1,
    },
    {
      sourceWorkflowId: 'wf-test',
      sourceNodeId: 'node-test-plan',
      sourceFullId: 'wf-test.node-test-plan',
      targetWorkflowId: 'wf-deployment',
      targetNodeId: 'node-deploy-plan',
      targetFullId: 'wf-deployment.node-deploy-plan',
      type: EdgeType.required,
      displayLabel: 'Test Plan → Deployment Plan',
      description: 'Readiness informs deployment',
      weight: 1,
    },
  ],
};