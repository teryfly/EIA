import { Phase } from '@prisma/client';

export interface DocTypeSeedData {
  id: string;
  name: string;
  code: string;
  workflow: string;
  category: string;
  description: string;
  template?: string;
  supportedFormats: string[];
  systemPrompt: string;
  group?: string;
  priority: number;
  isRequired: boolean;
  isActive: boolean;
  phases: Phase[];
  sourcesDocTypes: string[];
}

function prompt(title: string): string {
  return `You are an expert ${title} author. Produce clear, structured content that aligns with RUP methodology. Provide rationale, assumptions, and ensure traceability to upstream artifacts. Maintain professional tone, concise sections, and actionable outcomes. Include risks, dependencies, and acceptance criteria where applicable.`;
}

export const docTypesData: DocTypeSeedData[] = [
  {
    id: 'business_vision',
    name: 'Business Vision Document',
    code: 'BIZ_VISION',
    workflow: 'Business Modeling',
    category: 'Core',
    description:
      'Defines the business opportunity, problem statement, and high-level business goals',
    template: '# Business Vision\n\n## Executive Summary\n\n## Opportunity\n\n## Stakeholders\n\n## Goals & Success Criteria\n\n## Constraints & Assumptions\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('business vision'),
    group: 'Business Analysis',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Inception],
    sourcesDocTypes: [],
  },
  {
    id: 'vision',
    name: 'Vision Document',
    code: 'VISION',
    workflow: 'Requirements',
    category: 'Core',
    description:
      'Defines stakeholder needs, product vision, and high-level requirements',
    template:
      '# Vision Document\n\n## Introduction\n\n## Positioning\n\n## Stakeholders & Users\n\n## Product Overview\n\n## Product Features\n\n## Constraints\n\n## Quality Ranges\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('vision document'),
    group: 'Requirements',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Inception, Phase.Elaboration],
    sourcesDocTypes: ['business_vision'],
  },
  {
    id: 'use_case_model',
    name: 'Use-Case Model',
    code: 'UC_MODEL',
    workflow: 'Requirements',
    category: 'Core',
    description:
      'Identifies actors and use cases describing system behavior from user perspective',
    template:
      '# Use-Case Model\n\n## Actors\n\n## Use Cases\n\n## Diagrams\n\n## Narratives\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('use-case modeling'),
    group: 'Requirements',
    priority: 2,
    isRequired: true,
    isActive: true,
    phases: [Phase.Inception, Phase.Elaboration],
    sourcesDocTypes: ['vision'],
  },
  {
    id: 'software_architecture_document',
    name: 'Software Architecture Document',
    code: 'SAD',
    workflow: 'Analysis & Design',
    category: 'Core',
    description:
      'Defines architectural views, key decisions, and quality attribute tactics',
    template:
      '# Software Architecture Document\n\n## Overview\n\n## Views\n\n## Key Decisions\n\n## Risks\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('software architecture'),
    group: 'Architecture',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Elaboration, Phase.Construction],
    sourcesDocTypes: ['use_case_model', 'vision'],
  },
  {
    id: 'implementation_model',
    name: 'Implementation Model',
    code: 'IMPL_MODEL',
    workflow: 'Implementation',
    category: 'Core',
    description:
      'Maps design to code structure, modules, and build packaging',
    template:
      '# Implementation Model\n\n## Module Structure\n\n## Mapping to Design\n\n## Build Strategy\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('implementation modeling'),
    group: 'Engineering',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Construction],
    sourcesDocTypes: ['software_architecture_document'],
  },
  {
    id: 'test_plan',
    name: 'Test Plan',
    code: 'TEST_PLAN',
    workflow: 'Test',
    category: 'Core',
    description:
      'Strategy, scope, resources, schedule and responsibilities for testing',
    template:
      '# Test Plan\n\n## Scope\n\n## Strategy\n\n## Test Items\n\n## Schedule\n\n## Risks\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('test planning'),
    group: 'QA',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Construction, Phase.Transition],
    sourcesDocTypes: ['vision', 'use_case_model'],
  },
  {
    id: 'deployment_plan',
    name: 'Deployment Plan',
    code: 'DEPLOY_PLAN',
    workflow: 'Deployment',
    category: 'Core',
    description:
      'Plan for deploying the system to target environments and users',
    template:
      '# Deployment Plan\n\n## Environments\n\n## Steps\n\n## Rollback\n\n## Responsibilities\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('deployment planning'),
    group: 'Release',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [Phase.Transition],
    sourcesDocTypes: ['test_plan', 'implementation_model'],
  },
  {
    id: 'project_plan',
    name: 'Project Plan',
    code: 'PROJECT_PLAN',
    workflow: 'Project Management',
    category: 'Core',
    description:
      'Defines scope, schedule, resources, and risk management for the project',
    template:
      '# Project Plan\n\n## Scope\n\n## Milestones\n\n## Resources\n\n## Risks\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('project planning'),
    group: 'Management',
    priority: 1,
    isRequired: true,
    isActive: true,
    phases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    sourcesDocTypes: ['business_vision'],
  },
  {
    id: 'cm_plan',
    name: 'Configuration Management Plan',
    code: 'CM_PLAN',
    workflow: 'Configuration & Change Management',
    category: 'Core',
    description:
      'Configuration identification, control, status accounting, and audit plan',
    template:
      '# Configuration Management Plan\n\n## Scope\n\n## Baselines\n\n## Change Control\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('configuration management'),
    priority: 1,
    isRequired: false,
    isActive: true,
    phases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    sourcesDocTypes: ['project_plan'],
  },
  {
    id: 'development_case',
    name: 'Development Case',
    code: 'DEV_CASE',
    workflow: 'Environment',
    category: 'Core',
    description:
      'Tailoring of the process, practices, and tools for the project',
    template:
      '# Development Case\n\n## Process Tailoring\n\n## Tools\n\n## Templates\n',
    supportedFormats: ['markdown'],
    systemPrompt: prompt('process tailoring'),
    priority: 1,
    isRequired: false,
    isActive: true,
    phases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    sourcesDocTypes: ['project_plan'],
  },
];