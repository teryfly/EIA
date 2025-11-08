import { PrismaClient } from '@prisma/client';
import { docTypesData } from '../data/doc-types.data';

export async function seedDocTypes(prisma: PrismaClient): Promise<void> {
  const counts: Record<string, number> = {};
  for (const d of docTypesData) {
    await prisma.docType.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        code: d.code,
        workflow: d.workflow,
        category: d.category,
        description: d.description,
        template: d.template,
        supportedFormats: d.supportedFormats,
        systemPrompt: d.systemPrompt,
        group: d.group,
        priority: d.priority,
        isRequired: d.isRequired,
        isActive: d.isActive,
        phases: d.phases,
        sourcesDocTypes: d.sourcesDocTypes,
      },
      create: d,
    });
    counts[d.workflow] = (counts[d.workflow] || 0) + 1;
  }
  const total = docTypesData.length;
  console.log(`   ✓ Seeded ${total} DocTypes across ${Object.keys(counts).length} workflows`);
  for (const [wf, cnt] of Object.entries(counts)) {
    console.log(`     - ${wf}: ${cnt}`);
  }
}