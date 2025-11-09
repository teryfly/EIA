import { describe, it, expect } from 'vitest';
import { Phase } from '@/shared/types/enums';
import { PhaseMappingEntity } from '../../../domain/entities/phase-mapping.entity';

describe('PhaseMappingEntity - additional coverage', () => {
  it('fromPrisma and toPrisma round-trip and isPhaseAllowed/getStandardPhasesDisplay', () => {
    const now = new Date();
    const prismaObj = {
      id: 'pm1',
      workflowCode: 'Requirements',
      allowedPhases: [Phase.Inception, Phase.Elaboration] as any,
      description: 'standard',
      createdAt: now,
      updatedAt: now
    } as any;

    const entity = PhaseMappingEntity.fromPrisma(prismaObj);
    expect(entity.isPhaseAllowed(Phase.Inception)).toBe(true);
    expect(entity.isPhaseAllowed(Phase.Construction)).toBe(false);
    expect(entity.getStandardPhasesDisplay()).toBe('Inception, Elaboration');

    const back = entity.toPrisma() as any;
    expect(back.id).toBe('pm1');
    expect(back.workflowCode).toBe('Requirements');
    expect(back.allowedPhases).toEqual([Phase.Inception, Phase.Elaboration]);
    expect(back.createdAt).toBeInstanceOf(Date);
    expect(back.updatedAt).toBeInstanceOf(Date);

    const json = entity.toJSON();
    expect(json.allowedPhases).toEqual([Phase.Inception, Phase.Elaboration]);
    expect(typeof json.createdAt).toBe('string');
    expect(typeof json.updatedAt).toBe('string');
  });
});