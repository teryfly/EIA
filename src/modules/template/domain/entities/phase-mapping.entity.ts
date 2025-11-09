import { PhaseMapping as PrismaPhaseMapping } from '@prisma/client';
import { Phase } from '@/shared/types/enums';

export class PhaseMappingEntity {
  private constructor(
    public readonly id: string,
    public readonly workflowCode: string,
    public allowedPhases: Phase[],
    public description: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prisma: PrismaPhaseMapping): PhaseMappingEntity {
    return new PhaseMappingEntity(
      prisma.id,
      prisma.workflowCode,
      prisma.allowedPhases as Phase[],
      prisma.description,
      prisma.createdAt,
      prisma.updatedAt
    );
  }

  isPhaseAllowed(phase: Phase): boolean {
    return this.allowedPhases.includes(phase);
  }

  getStandardPhasesDisplay(): string {
    return this.allowedPhases.join(', ');
  }

  toPrisma(): Omit<PrismaPhaseMapping, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date } {
    return {
      id: this.id,
      workflowCode: this.workflowCode,
      allowedPhases: this.allowedPhases,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return {
      id: this.id,
      workflowCode: this.workflowCode,
      allowedPhases: this.allowedPhases,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}