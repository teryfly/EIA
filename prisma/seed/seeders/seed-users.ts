import { PrismaClient } from '@prisma/client';
import { usersData } from '../data/users.data';

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        department: userData.department,
        isActive: userData.isActive,
      },
      create: userData,
    });
  }
  console.log(`   ✓ Processed ${usersData.length} users`);
}