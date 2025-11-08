import { getPrisma } from './test-helpers';

export async function cleanupTestUsers(): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.deleteMany({
    where: { username: { startsWith: 'test-' } },
  });
}

export async function cleanupTestDocTypes(): Promise<void> {
  const prisma = getPrisma();
  await prisma.docType.deleteMany({
    where: { id: { startsWith: 'test-doctype-' } },
  });
}

export async function cleanupCustomTemplates(): Promise<void> {
  const prisma = getPrisma();
  await prisma.rUPTemplate.deleteMany({
    where: { category: 'Custom' as any },
  });
}

export async function resetAIDraftSequence(): Promise<void> {
  const prisma = getPrisma();
  await prisma.aIDraftSequence.update({
    where: { id: 'global' },
    data: { nextNumber: BigInt(1) as any },
  });
}