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
- npm run test:shared (shared module tests)
- npx vitest run -c src/vitest.config.ts
- npx vitest run -c src/vitest.config.ts --coverage