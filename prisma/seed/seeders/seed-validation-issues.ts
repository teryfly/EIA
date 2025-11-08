import { PrismaClient } from '@prisma/client';
import { validationIssuesData } from '../data/validation-issues.data';

export async function seedValidationIssues(prisma: PrismaClient): Promise<void> {
  await prisma.validationIssue.deleteMany({
    where: { templateId: '00000000-0000-0000-0000-000000000001' },
  });

  for (const issue of validationIssuesData) {
    await prisma.validationIssue.create({ data: issue });
  }
  console.log(`   ✓ Seeded ${validationIssuesData.length} demo validation issues`);
}