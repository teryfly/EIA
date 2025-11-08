import { describe, it, expect } from 'vitest';
import { getPrisma, measureTime } from '../utils/test-helpers';

describe('Query Performance', () => {
  const prisma = getPrisma();

  it('admin email lookup should be < 200ms', async () => {
    const { durationMs, result } = await measureTime(async () => {
      return prisma.user.findUnique({ where: { email: 'admin@rup-system.local' } });
    });
    expect(durationMs).toBeLessThan(200);
    expect(result === null || typeof result === 'object').toBe(true);
  });
});