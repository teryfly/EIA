import { describe, it, expect } from 'vitest';
describe('Prisma Enums Presence', () => {
  it('should expose required enums', () => {
    const client = require('@prisma/client');
    const enums = [
      'Phase',
      'TemplateCategory',
      'TemplateStatus',
      'EdgeType',
      'IssueSeverity',
      'IssueType',
      'UserRole',
      'PrerequisiteType', // Added in schema update
    ];
    for (const k of enums) {
      expect(client[k]).toBeDefined();
    }
  });
});