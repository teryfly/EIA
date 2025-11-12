# Module M03A: Template BC - Core Domain

This module implements core domain logic for RUP template management.

Structure:
- domain/aggregates: RUPTemplate, WorkflowDefinition
- domain/entities: FlowTemplateNodeEntity, ValidationIssueEntity, PhaseMappingEntity, TemplateConfigEntity
- domain/services: PhaseValidationService, TemplateValidationService
- domain/value-objects: ValidationReport
- domain/events: domain events index + specific events
- repositories: Prisma data access
- use-cases: Template/Workflow/Node CRUD, validate, publish, archive, clone
- __tests__: Unit tests for aggregates, entities, services

Run tests (root):
- npm run test:M02 (shared module tests)
- npm run test:M03A (template module tests)
- npm run test:coverage

M03B-1 Additions:
- domain/entities: FlowTemplateEdgeEntity, CrossFlowDependencyEntity
- domain/events: EdgeAdded/EdgeUpdated, CrossFlowDependencyAdded/CrossFlowDependencyUpdated
- shared/utils: graph-utils with cycle detection and helpers
- tests:
  - src/modules/template/__tests__/domain/entities/flow-template-edge.entity.test.ts
  - src/modules/template/__tests__/domain/entities/cross-flow-dependency.entity.test.ts
  - src/shared/__tests__/utils/graph-utils.test.ts