import { prisma } from '@/prisma/client';
import { PhaseMappingEntity } from '../domain/entities/phase-mapping.entity';

export class PhaseMappingRepository {
  async findByWorkflowCode(code: string): Promise<PhaseMappingEntity | null> {
    const m = await prisma.phaseMapping.findUnique({ where: { workflowCode: code } });
    return m ? PhaseMappingEntity.fromPrisma(m) : null;
  }

  async findAll(): Promise<PhaseMappingEntity[]> {
    const ms = await prisma.phaseMapping.findMany({ orderBy: { workflowCode: 'asc' } });
    return ms.map(PhaseMappingEntity.fromPrisma);
  }

  async hasMapping(code: string): Promise<boolean> {
    const c = await prisma.phaseMapping.count({ where: { workflowCode: code } });
    return c > 0;
  }

  async getAllWorkflowCodes(): Promise<string[]> {
    const ms = await prisma.phaseMapping.findMany({ select: { workflowCode: true }, orderBy: { workflowCode: 'asc' } });
    return ms.map((m) => m.workflowCode);
  }
}