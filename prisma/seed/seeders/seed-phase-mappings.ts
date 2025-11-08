import { PrismaClient } from '@prisma/client';
import { phaseMappingsData } from '../data/phase-mappings.data';

export async function seedPhaseMappings(prisma: PrismaClient): Promise<void> {
  for (const mapping of phaseMappingsData) {
    await prisma.phaseMapping.upsert({
      where: { workflowCode: mapping.workflowCode },
      update: {
        allowedPhases: mapping.allowedPhases,
        description: mapping.description,
      },
      create: mapping,
    });
  }
  console.log(`   ✓ Seeded ${phaseMappingsData.length} Phase Mappings`);
}