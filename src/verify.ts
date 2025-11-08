import { prisma } from '../prisma/client';

async function main() {
  const models = Object.keys(prisma).filter(
    (k) => !k.startsWith('$') && !k.startsWith('_')
  );
  console.log(`Models available: ${models.length}`);

  const user = await prisma.user.create({
    data: {
      username: 'test',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'developer' as any
    }
  });
  const fetched = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('User CRUD OK:', Boolean(fetched?.id));
  await prisma.user.delete({ where: { id: user.id } });
}

main().then(() => prisma.$disconnect());