Test and Seed Data Isolation Notes

- TestDataBuilder uses:
  - TemplateCategory.Custom to avoid conflicting with seeded Standard templates
  - DocType codes prefixed with TEST_DOC_<templateId>_* to avoid collisions
  - Unique workflow/node IDs derived from templateId
- Integration and repository tests must use IDs returned by TestDataBuilder.getIds(templateId)
- Cleanup order is strict to respect FK constraints:
  FlowTemplateEdge -> CrossFlowDependency -> FlowTemplateNode -> WorkflowDefinition -> RUPTemplate -> DocType(TEST_DOC_*)
- If you run seeds before tests, no conflicts should occur due to namespacing.