import { describe, it, expect } from 'vitest';
import { RUPTemplate } from '../../../domain/aggregates/rup-template';
import { TemplateCategory, TemplateStatus } from '@prisma/client';
import { ValidationReport } from '../../../domain/value-objects/validation-report';

describe('RUPTemplate Aggregate', () => {
  it('creates with Draft status and emits event', () => {
    const t = RUPTemplate.create({ name: 'Test', category: TemplateCategory.Custom });
    expect(t.status).toBe(TemplateStatus.Draft);
    expect(t.getDomainEvents()[0].constructor.name).toBe('TemplateCreatedEvent');
  });

  it('updates metadata and timestamps', () => {
    const t = RUPTemplate.create({ name: 'Name', category: TemplateCategory.Custom });
    const oldUpdated = t.updatedAt.getTime();
    t.update({ name: 'New Name', description: 'desc', estimatedDuration: '6m' });
    expect(t.name).toBe('New Name');
    expect(t.description).toBe('desc');
    expect(t.estimatedDuration).toBe('6m');
    expect(t.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdated);
  });

  it('throws on invalid update for published standard', () => {
    const t = RUPTemplate.create({ name: 'Std', category: TemplateCategory.Standard });
    const report = ValidationReport.createValid(t.id);
    t.publish(report);
    expect(() => t.update({ name: 'x' })).toThrow('Cannot update published standard templates');
  });

  it('publish and archive flows', () => {
    const t = RUPTemplate.create({ name: 'A', category: TemplateCategory.Custom });
    const report = ValidationReport.createValid(t.id);
    t.publish(report);
    expect(t.status).toBe(TemplateStatus.Published);
    expect(t.getDomainEvents().pop()?.constructor.name).toBe('TemplatePublishedEvent');
    t.archive();
    expect(t.status).toBe(TemplateStatus.Archived);
  });

  it('validation failed then reset to draft', () => {
    const t = RUPTemplate.create({ name: 'A', category: TemplateCategory.Custom });
    t.markValidationFailed();
    expect(t.status).toBe(TemplateStatus.ValidationFailed);
    t.resetToDraft();
    expect(t.status).toBe(TemplateStatus.Draft);
  });
});