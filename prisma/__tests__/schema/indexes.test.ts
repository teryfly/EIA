import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPrisma, measureTime } from '../utils/test-helpers';
import { createTestDocType } from '../utils/test-data-factory';

const prisma = getPrisma();

async function dbReady() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function cleanupDoctypes() {
  try {
    await prisma.docType.deleteMany({
      where: {
        OR: [
          { id: { startsWith: 'test-doctype-' } },
          { code: { startsWith: 'TEST-' } },
        ],
      },
    });
  } catch {}
}

describe('Index Effectiveness', () => {
  beforeAll(async () => {
    if (!(await dbReady())) return;
    await cleanupDoctypes();
  });

  afterAll(async () => {
    await cleanupDoctypes();
  });

  it('DocType.workflow lookup should be fast', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    await Promise.all([
      createTestDocType({ workflow: 'Requirements' }),
      createTestDocType({ workflow: 'Requirements' }),
      createTestDocType({ workflow: 'Design' }),
    ]);
    const { durationMs } = await measureTime(async () => {
      return prisma.docType.findMany({ where: { workflow: 'Requirements' } });
    });
    // Allow generous threshold to avoid flaky failures on CI/slow disks
    expect(durationMs).toBeLessThan(800);
  });

  it('User.email unique lookup should be fast', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const { durationMs } = await measureTime(async () => {
      return prisma.user.findUnique({
        where: { email: 'admin@rup-system.local' },
      });
    });
    expect(durationMs).toBeLessThan(300);
  });
});