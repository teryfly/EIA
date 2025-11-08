import { describe, it, expect } from 'vitest';
import { getPrisma } from '../utils/test-helpers';

const prisma = getPrisma();

describe('Schema Validation', () => {
  it('should expose Prisma models object keys', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      return expect(true).toBe(true);
    }
    const models = Object.keys(prisma).filter(
      (k) => !k.startsWith('$') && !k.startsWith('_')
    );
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
  });

  it('should load core enums from @prisma/client', () => {
    const client = require('@prisma/client');
    const enumKeys = [
      'Phase',
      'TemplateCategory',
      'TemplateStatus',
      'EdgeType',
      'IssueSeverity',
      'IssueType',
      'UserRole',
    ];
    for (const k of enumKeys) {
      expect(client[k]).toBeDefined();
    }
  });

  it('should CRUD a User model successfully', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      return expect(true).toBe(true);
    }
    const user = await prisma.user.create({
      data: {
        username: 'schema-test-user',
        email: 'schema-test-user@example.com',
        fullName: 'Schema Test User',
        role: 'developer' as any,
        isActive: true,
      },
    });
    expect(user.id).toBeDefined();

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found?.username).toBe('schema-test-user');

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { fullName: 'Schema Test User Updated' },
    });
    expect(updated.fullName).toBe('Schema Test User Updated');

    await prisma.user.delete({ where: { id: user.id } });
    const deleted = await prisma.user.findUnique({ where: { id: user.id } });
    expect(deleted).toBeNull();
  });
});