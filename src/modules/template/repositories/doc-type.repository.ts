import { prisma } from '@/prisma/client';
import { DocType } from '@prisma/client';
import { Phase } from '@/shared/types/enums';

export class DocTypeRepository {
  async findById(id: string): Promise<DocType | null> {
    return prisma.docType.findUnique({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const c = await prisma.docType.count({ where: { id } });
    return c > 0;
  }

  async findAll(): Promise<DocType[]> {
    return prisma.docType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async findByWorkflow(workflow: string): Promise<DocType[]> {
    return prisma.docType.findMany({ where: { workflow, isActive: true }, orderBy: { priority: 'asc' } });
  }

  async getPhases(docTypeId: string): Promise<Phase[]> {
    const dt = await prisma.docType.findUnique({ where: { id: docTypeId }, select: { phases: true } });
    if (!dt) return [];
    return dt.phases as Phase[];
  }
}