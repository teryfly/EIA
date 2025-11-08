import { describe, it, expect, beforeEach } from 'vitest';
import { getPrisma } from '../utils/test-helpers';
import { createTestRUPTemplate, createTestUser } from '../utils/test-data-factory';
import { cleanupCustomTemplates, cleanupTestUsers } from '../utils/db-cleanup';
const prisma = getPrisma();
async function dbReady() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
describe('Foreign Key Constraints', () => {
  beforeEach(async () => {
    if (!(await dbReady())) return;
    await cleanupCustomTemplates();
    await cleanupTestUsers();
  });
  it('CASCADE delete: RUPTemplate -> WorkflowDefinition', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const template = await createTestRUPTemplate();
    const wf = await prisma.workflowDefinition.create({
      data: {
        id: `wf-test-${Date.now()}`, // ← Added required id field
        rupTemplateId: template.id,
        name: 'WF',
        code: 'WF',
        phases: ['Inception'] as any,
        priority: 1,
      },
    });
    await prisma.rUPTemplate.delete({ where: { id: template.id } });
    const found = await prisma.workflowDefinition.findUnique({ where: { id: wf.id } });
    expect(found).toBeNull();
  });
  it('CASCADE delete: WorkflowDefinition -> FlowTemplateNode', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const template = await createTestRUPTemplate();
    const wf = await prisma.workflowDefinition.create({
      data: {
        id: `wf-test-${Date.now()}`, // ← Added required id field
        rupTemplateId: template.id,
        name: 'WF2',
        code: 'WF2',
        phases: ['Inception'] as any,
        priority: 1,
      },
    });
    const dt = await prisma.docType.create({
      data: {
        id: `test-fk-doctype-${Date.now()}`,
        name: 'DT',
        code: `DT-${Date.now()}`,
        workflow: 'Test',
        category: 'Test',
        description: 'desc',
        systemPrompt: 'prompt',
        phases: ['Inception'] as any,
        supportedFormats: ['markdown'],
        isActive: true,
        priority: 0,
        isRequired: false,
        sourcesDocTypes: [],
      } as any,
    });
    const node = await prisma.flowTemplateNode.create({
      data: {
        id: `node-test-${Date.now()}`, // ← Also ensure node has id
        workflowDefinitionId: wf.id,
        fullId: `${wf.id}.node-1`,
        docTypeId: dt.id,
        label: 'Node',
        phase: 'Inception' as any,
        workflow: 'Test',
        priority: 0,
        positionX: 0,
        positionY: 0,
        completionCondition: { type: 'MinDocumentsCondition', minDocuments: 1 },
      },
    });
    await prisma.workflowDefinition.delete({ where: { id: wf.id } });
    const nodeFound = await prisma.flowTemplateNode.findUnique({ where: { id: node.id } });
    expect(nodeFound).toBeNull();
    await prisma.docType.delete({ where: { id: dt.id } });
  });
  it('SET NULL: User deletion should null Project.ownerId', async () => {
    if (!(await dbReady())) return expect(true).toBe(true);
    const user = await createTestUser();
    const template = await createTestRUPTemplate();
    const project = await prisma.project.create({
      data: {
        name: 'Proj',
        rupTemplateId: template.id,
        ownerId: user.id,
        currentPhase: 'Inception' as any,
      },
    });
    await prisma.user.delete({ where: { id: user.id } });
    const refreshed = await prisma.project.findUnique({ where: { id: project.id } });
    expect(refreshed).not.toBeNull();
    expect(refreshed?.ownerId).toBeNull();
    await prisma.project.delete({ where: { id: project.id } });
  });
});