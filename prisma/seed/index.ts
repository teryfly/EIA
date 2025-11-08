import { prisma } from '../client';
import { seedUsers } from './seeders/seed-users';
import { seedDocTypes } from './seeders/seed-doc-types';
import { seedPhaseMappings } from './seeders/seed-phase-mappings';
import { seedRUPTemplate } from './seeders/seed-rup-template';
import { seedValidationIssues } from './seeders/seed-validation-issues';
import { seedConfigs } from './seeders/seed-configs';
import { seedAIDraftSequence } from './seeders/seed-ai-draft-sequence';

async function main() {
  const start = Date.now();
  console.log('🌱 Starting database seed...\n');

  try {
    console.log('👥 [1/7] Seeding Users...');
    await seedUsers(prisma);
    console.log('   ✓ Users seeded\n');

    console.log('📚 [2/7] Seeding DocTypes...');
    await seedDocTypes(prisma);
    console.log('   ✓ DocTypes seeded\n');

    console.log('🔄 [3/7] Seeding Phase Mappings...');
    await seedPhaseMappings(prisma);
    console.log('   ✓ Phase Mappings seeded\n');

    console.log('📋 [4/7] Seeding Standard RUP Template...');
    await seedRUPTemplate(prisma);
    console.log('   ✓ RUP Template seeded\n');

    console.log('⚠️  [5/7] Seeding Validation Issues...');
    await seedValidationIssues(prisma);
    console.log('   ✓ Validation Issues seeded\n');

    console.log('⚙️  [6/7] Seeding Default Configurations...');
    await seedConfigs(prisma);
    console.log('   ✓ Configurations seeded\n');

    console.log('🔢 [7/7] Initializing AI Draft Sequence...');
    await seedAIDraftSequence(prisma);
    console.log('   ✓ AI Draft Sequence initialized\n');

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Database seed completed successfully in ${duration}s!`);
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    throw err;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });