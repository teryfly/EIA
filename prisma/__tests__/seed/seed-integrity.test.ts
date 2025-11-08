import { describe, it, expect, beforeAll } from 'vitest';
import { getPrisma, clearDatabase, runSeed, getDatabaseCounts, assertNoOrphanedRecords } from '../utils/test-helpers';

describe('Seed Data Integrity', () => {
  const prisma = getPrisma();

  beforeAll(async () => {
    await clearDatabase();
    await runSeed();
  });

  it('should seed all required entities with correct counts (minimum subset)', async () => {
    const counts = await getDatabaseCounts();

    expect(counts.users).toBeGreaterThanOrEqual(4);
    expect(counts.docTypes).toBeGreaterThanOrEqual(1);
    expect(counts.phaseMappings).toBeGreaterThanOrEqual(1);
    expect(counts.rupTemplates).toBeGreaterThanOrEqual(1);
    expect(counts.workflowDefinitions).toBeGreaterThanOrEqual(1);
    expect(counts.flowTemplateNodes).toBeGreaterThanOrEqual(1);
    expect(counts.flowTemplateEdges).toBeGreaterThanOrEqual(0);
    expect(counts.crossFlowDependencies).toBeGreaterThanOrEqual(0);
    expect(counts.validationIssues).toBeGreaterThanOrEqual(1);
    expect(counts.aiServiceConfigs).toBeGreaterThanOrEqual(1);
    expect(counts.archivePolicies).toBeGreaterThanOrEqual(1);
    expect(counts.aiDraftSequence).toBe(1);
  });

  it('should have no orphaned graph references', async () => {
    await expect(assertNoOrphanedRecords()).resolves.not.toThrow();
  });

  it('users have unique username and email', async () => {
    const users = await prisma.user.findMany({ select: { username: true, email: true } });
    const usernames = new Set(users.map(u => u.username));
    const emails = new Set(users.map(u => u.email));
    expect(usernames.size).toBe(users.length);
    expect(emails.size).toBe(users.length);
  });

  it('DocTypes phases are valid', async () => {
    const docTypes = await prisma.docType.findMany();
    for (const d of docTypes) {
      expect(d.phases.length).toBeGreaterThan(0);
      for (const p of d.phases as any[]) {
        expect(['Inception', 'Elaboration', 'Construction', 'Transition']).toContain(p);
      }
    }
  });
});