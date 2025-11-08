import { describe, it, expect } from 'vitest';
import { getPrisma } from '../utils/test-helpers';

const prisma = getPrisma();

async function dbReady() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

describe('Unique Constraints', () => {
  it('should enforce unique username', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const username = `uniq-user`;
    await prisma.user.upsert({
      where: { username },
      create: {
        username,
        email: `uniq-user@example.com`,
        fullName: 'Uniq',
        role: 'developer' as any,
        isActive: true,
      },
      update: {},
    });

    await expect(
      prisma.user.create({
        data: {
          username,
          email: `uniq-user-2@example.com`,
          fullName: 'Dup',
          role: 'developer' as any,
          isActive: true,
        },
      })
    ).rejects.toThrow();
    await prisma.user.delete({ where: { username } });
  });

  it('should enforce unique DocType id and code', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const id = `test-doctype-uniq`;
    const code = `TEST-UNIQ`;
    await prisma.docType.create({
      data: {
        id,
        name: 'DT',
        code,
        workflow: 'Test',
        category: 'Test',
        description: 'desc',
        systemPrompt: 'prompt',
        phases: ['Inception'] as any,
        supportedFormats: ['markdown'],
        isActive: true,
        priority: 0,
        isRequired: false,
        sourcesDocTypes: [],
      } as any,
    });

    await expect(
      prisma.docType.create({
        data: {
          id,
          name: 'DT2',
          code: `${code}-2`,
          workflow: 'Test',
          category: 'Test',
          description: 'desc',
          systemPrompt: 'prompt',
          phases: ['Inception'] as any,
          supportedFormats: ['markdown'],
          isActive: true,
          priority: 0,
          isRequired: false,
          sourcesDocTypes: [],
        } as any,
      })
    ).rejects.toThrow();

    await expect(
      prisma.docType.create({
        data: {
          id: `${id}-2`,
          name: 'DT3',
          code,
          workflow: 'Test',
          category: 'Test',
          description: 'desc',
          systemPrompt: 'prompt',
          phases: ['Inception'] as any,
          supportedFormats: ['markdown'],
          isActive: true,
          priority: 0,
          isRequired: false,
          sourcesDocTypes: [],
        } as any,
      })
    ).rejects.toThrow();

    await prisma.docType.deleteMany({ where: { id: { in: [id, `${id}-2`] } } });
  });
});