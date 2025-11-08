import { PrismaClient } from '@prisma/client';
import { getTestPrisma } from '../../setup-tests';

export function getPrisma(): PrismaClient {
  return getTestPrisma();
}

export async function clearDatabase(): Promise<void> {
  const prisma = getPrisma();

  // Clear core models in a single transaction using only Prisma Client promises
  await prisma.$transaction([
    prisma.validationIssue.deleteMany(),
    prisma.crossFlowDependency.deleteMany(),
    prisma.flowTemplateEdge.deleteMany(),
    prisma.flowTemplateNode.deleteMany(),
    prisma.workflowDefinition.deleteMany(),
    prisma.rUPTemplate.deleteMany(),
    prisma.archivePolicy.deleteMany(),
    prisma.aIServiceConfig.deleteMany(),
    prisma.phaseMapping.deleteMany(),
    prisma.docType.deleteMany(),
    prisma.user.deleteMany(),
    prisma.aIDraftSequence.deleteMany(),
  ]);

  // Best-effort clean-up of optional models, executed sequentially
  const maybeDelete = async (modelName: string) => {
    const model = (prisma as any)[modelName];
    if (model && typeof model.deleteMany === 'function') {
      try {
        await model.deleteMany();
      } catch {
        // ignore
      }
    }
  };

  await maybeDelete('prerequisite');
  await maybeDelete('backgroundGenerationTask');
  await maybeDelete('draftGenerationMeta');
  await maybeDelete('aIMessage');
  await maybeDelete('aIDraft');
  await maybeDelete('conversationSession');
  await maybeDelete('documentVersion');
  await maybeDelete('document');
  await maybeDelete('nodeInstance');
  await maybeDelete('workflowInstance');
  await maybeDelete('flowInstance');
  await maybeDelete('templateConfig');
  await maybeDelete('archiveJob');
  await maybeDelete('regenerationAlert');
  await maybeDelete('upstreamClarificationAlert');
}

export async function runSeed(): Promise<void> {
  const { execSync } = await import('child_process');
  execSync('npx tsx prisma/seed/index.ts', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });
}

export async function getDatabaseCounts(): Promise<Record<string, number>> {
  const prisma = getPrisma();
  return {
    users: await prisma.user.count(),
    docTypes: await prisma.docType.count(),
    phaseMappings: await prisma.phaseMapping.count(),
    rupTemplates: await prisma.rUPTemplate.count(),
    workflowDefinitions: await prisma.workflowDefinition.count(),
    flowTemplateNodes: await prisma.flowTemplateNode.count(),
    flowTemplateEdges: await prisma.flowTemplateEdge.count(),
    crossFlowDependencies: await prisma.crossFlowDependency.count(),
    validationIssues: await prisma.validationIssue.count(),
    aiServiceConfigs: await prisma.aIServiceConfig.count(),
    archivePolicies: await prisma.archivePolicy.count(),
    aiDraftSequence: await prisma.aIDraftSequence.count(),
  };
}

export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - start };
}

export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Assert no broken references using existence queries instead of relational null filters,
 * to avoid Prisma validation errors when relation fields are not filterable by null.
 */
export async function assertNoOrphanedRecords(): Promise<void> {
  const prisma = getPrisma();

  // FlowTemplateEdges must reference existing nodes by fullId
  const edges = await prisma.flowTemplateEdge.findMany({
    select: { source: true, target: true },
  });

  // Build a set of all node fullIds
  const nodes = await prisma.flowTemplateNode.findMany({
    select: { fullId: true },
  });
  const nodeFullIds = new Set(nodes.map((n) => n.fullId));

  let broken = 0;
  for (const e of edges) {
    if (!nodeFullIds.has(e.source) || !nodeFullIds.has(e.target)) {
      broken++;
    }
  }
  if (broken > 0) {
    throw new Error(`Found ${broken} edges with broken node references`);
  }

  // Documents should reference existing NodeInstances when nodeInstanceId exists
  if ((prisma as any).document) {
    const docs = await (prisma as any).document.findMany({
      select: { nodeInstanceId: true },
    });
    const withRef = docs.filter((d: any) => Boolean(d.nodeInstanceId));
    if (withRef.length > 0 && (prisma as any).nodeInstance) {
      const nodeInstanceIds = new Set(
        (
          await (prisma as any).nodeInstance.findMany({
            select: { id: true },
          })
        ).map((n: any) => n.id)
      );
      const missing = withRef.filter(
        (d: any) => !nodeInstanceIds.has(d.nodeInstanceId)
      ).length;
      if (missing > 0) {
        throw new Error(`Found ${missing} documents with missing node instances`);
      }
    }
  }
}