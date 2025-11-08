import { PrismaClient } from '@prisma/client';
import { aiDraftSequenceData } from '../data/ai-draft-sequence.data';

export async function seedAIDraftSequence(prisma: PrismaClient): Promise<void> {
  await prisma.aIDraftSequence.upsert({
    where: { id: aiDraftSequenceData.id },
    update: {},
    create: aiDraftSequenceData,
  });
  const seq = await prisma.aIDraftSequence.findUnique({ where: { id: 'global' } });
  console.log(`   ✓ AI Draft Sequence initialized (next: ${seq?.nextNumber})`);
}