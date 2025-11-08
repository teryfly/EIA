import { PrismaClient } from '@prisma/client';
import { aiServiceConfigData, archivePolicyData } from '../data/default-configs.data';

export async function seedConfigs(prisma: PrismaClient): Promise<void> {
  const existingAI = await prisma.aIServiceConfig.findFirst({ where: { isActive: true } });
  if (!existingAI) {
    await prisma.aIServiceConfig.create({ data: aiServiceConfigData });
    console.log('     ✓ Created default AI service config');
  } else {
    console.log('     ✓ Active AI service config already exists');
  }

  const existingPolicy = await prisma.archivePolicy.findFirst({ where: { isActive: true } });
  if (!existingPolicy) {
    await prisma.archivePolicy.create({ data: archivePolicyData });
    console.log('     ✓ Created default archive policy');
  } else {
    console.log('     ✓ Active archive policy already exists');
  }
}