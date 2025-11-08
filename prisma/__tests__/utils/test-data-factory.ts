import { PrismaClient, Phase, UserRole } from '@prisma/client';
import { getPrisma } from './test-helpers';
function uniqSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
export async function createTestUser(overrides?: Partial<{
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}>): Promise<{ id: string }> {
  const prisma = getPrisma();
  const suf = uniqSuffix();
  const user = await prisma.user.create({
    data: {
      username: overrides?.username || `test-${suf}`,
      email: overrides?.email || `test-${suf}@example.com`,
      fullName: overrides?.fullName || 'Test User',
      role: overrides?.role || (UserRole as any).developer || 'developer',
      isActive: true,
    } as any,
  });
  return user;
}
export async function createTestDocType(overrides?: Partial<{
  id: string;
  name: string;
  workflow: string;
  phases: Phase[];
  code: string;
}>): Promise<{ id: string }> {
  const prisma = getPrisma();
  const tryCreate = async (): Promise<{ id: string }> => {
    const suf = uniqSuffix();
    const id = overrides?.id || `test-doctype-${suf}`;
    const code = overrides?.code || `TEST-${suf}`;
    return prisma.docType.create({
      data: {
        id,
        name: overrides?.name || `Test DocType ${suf}`,
        code,
        workflow: overrides?.workflow || 'Test Workflow',
        category: 'Test',
        description: 'Test DocType',
        systemPrompt: 'Test system prompt',
        phases: overrides?.phases || [Phase.Inception],
        isActive: true,
        priority: 0,
        isRequired: false,
        supportedFormats: ['markdown'],
        sourcesDocTypes: [],
      } as any,
    });
  };
  // Retry a few times to avoid extremely rare collisions across parallel forks
  const maxAttempts = 5;
  let lastErr: any;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await tryCreate();
    } catch (err: any) {
      lastErr = err;
      // If unique constraint error, retry with a new suffix; otherwise throw
      if (String(err?.code || '').toUpperCase() === 'P2002' || /Unique constraint failed/i.test(String(err?.message))) {
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
export async function createTestRUPTemplate(overrides?: Partial<{
  name: string;
  description: string;
  category: string;
  status: string;
}>): Promise<{ id: string }> {
  const prisma = getPrisma();
  const template = await prisma.rUPTemplate.create({
    data: {
      name: overrides?.name || `Test Template ${uniqSuffix()}`,
      description: overrides?.description || 'Test RUP Template for automated testing',
      category: (overrides?.category as any) || 'Custom',
      status: (overrides?.status as any) || 'Draft',
    },
  });
  return template;
}
export async function createTestProject(
  rupTemplateId: string,
  ownerId?: string
): Promise<{ id: string }> {
  const prisma = getPrisma();
  const project = await prisma.project.create({
    data: {
      name: `Test Project ${uniqSuffix()}`,
      rupTemplateId,
      ownerId,
      currentPhase: (Phase as any).Inception || 'Inception',
    } as any,
  });
  return project;
}