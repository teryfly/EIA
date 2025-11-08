import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';

function loadEnv() {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    // Lazy import to avoid extra dep if not needed
    const dotenv = require('dotenv');
    dotenv.config({ path: dotenvPath });
  }
}
loadEnv();

const ENV_DB_URL = process.env.DATABASE_URL;

if (!ENV_DB_URL) {
  console.warn('DATABASE_URL not found in .env. Please set it to a valid PostgreSQL URL.');
}

const TEST_DATABASE_URL = ENV_DB_URL || 'postgresql://test:test@localhost:5432/rup_ai_test?schema=public';

// Ensure Prisma reads this URL during commands
process.env.DATABASE_URL = TEST_DATABASE_URL;

let prisma: PrismaClient | null = null;

export async function setup() {
  try {
    // Push schema to the database defined by DATABASE_URL from .env
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });
    prisma = new PrismaClient({
      datasources: { db: { url: TEST_DATABASE_URL } },
    });
  } catch (error) {
    console.error('Failed to setup test DB:', error);
    throw error;
  }
}

export async function teardown() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: { db: { url: TEST_DATABASE_URL } },
    });
  }
  return prisma;
}