import { describe, it, expect } from 'vitest';
import { RUPTemplate } from '../../../domain/aggregates/rup-template';
import { TemplateCategory, TemplateStatus } from '@prisma/client';
import { ValidationReport } from '../../../domain/value-objects/validation-report';

describe('RUPTemplate Aggregate - additional coverage', () => {
  it('validateName guards on empty and length constraints via update', () => {
    const t = RUPTemplate.create({ name: 'Valid Name', category: TemplateCategory.Custom });
    expect(() => t.update({ name: '' as any })).toThrow('Template name cannot be empty');
    expect(() => t.update({ name: 'A' })).toThrow('Template name must be between 2 and 100 characters');
    const long = 'x'.repeat(101);
    expect(() => t.update({ name: long })).toThrow('Template name must be between 2 and 100 characters');
  });

  it('restore only allowed from Archived', () => {
    const t = RUPTemplate.create({ name: 'X', category: TemplateCategory.Custom });
    expect(() => t.restore()).toThrow('Can only restore archived templates');
    t.archive();
    t.restore();
    expect(t.status).toBe(TemplateStatus.Draft);
  });

  it('canDelete true only for non-Standard draft', () => {
    const custom = RUPTemplate.create({ name: 'C', category: TemplateCategory.Custom });
    expect(custom.canDelete()).toBe(true);
    const std = RUPTemplate.create({ name: 'S', category: TemplateCategory.Standard });
    expect(std.canDelete()).toBe(false);
    const report = ValidationReport.createValid(custom.id);
    custom.publish(report);
    expect(custom.canDelete()).toBe(false);
  });

  it('canPublish only in Draft', () => {
    const t = RUPTemplate.create({ name: 'X', category: TemplateCategory.Custom });
    expect(t.canPublish()).toBe(true);
    const report = ValidationReport.createValid(t.id);
    t.publish(report);
    expect(t.canPublish()).toBe(false);
  });

  it('domain events clear and retrieval', () => {
    const t = RUPTemplate.create({ name: 'Ev', category: TemplateCategory.Custom });
    const initial = t.getDomainEvents();
    expect(initial.length).toBeGreaterThan(0);
    t.clearDomainEvents();
    expect(t.getDomainEvents().length).toBe(0);
  });

  it('toPrisma contains timestamps and fields', () => {
    const t = RUPTemplate.create({ name: 'P', category: TemplateCategory.Custom, description: 'd', estimatedDuration: '1m' });
    const prismaObj = t.toPrisma() as any;
    expect(prismaObj.id).toBe(t.id);
    expect(prismaObj.name).toBe('P');
    expect(prismaObj.description).toBe('d');
    expect(prismaObj.estimatedDuration).toBe('1m');
    expect(prismaObj.createdAt).toBeInstanceOf(Date);
    expect(prismaObj.updatedAt).toBeInstanceOf(Date);
  });

  it('publish throws when invalid report and when already published', () => {
    const t = RUPTemplate.create({ name: 'P', category: TemplateCategory.Custom });
    const invalid = ValidationReport.createInvalid(t.id, [] as any, []);
    expect(() => t.publish(invalid)).toThrow('Cannot publish template with validation errors');
    const valid = ValidationReport.createValid(t.id);
    t.publish(valid);
    expect(() => t.publish(valid)).toThrow('Template is already published');
  });

  it('archive throws for Standard and when already archived', () => {
    const std = RUPTemplate.create({ name: 'S', category: TemplateCategory.Standard });
    expect(() => std.archive()).toThrow('Cannot archive standard templates');
    const custom = RUPTemplate.create({ name: 'CX', category: TemplateCategory.Custom });
    custom.archive();
    expect(() => custom.archive()).toThrow('Template is already archived');
  });

  it('validation failed state transitions', () => {
    const t = RUPTemplate.create({ name: 'V', category: TemplateCategory.Custom });
    t.markValidationFailed();
    expect(t.status).toBe(TemplateStatus.ValidationFailed);
    expect(() => RUPTemplate.create({ name: 'ok', category: TemplateCategory.Custom })).not.toThrow();
    expect(() => t.resetToDraft()).not.toThrow();
    expect(t.status).toBe(TemplateStatus.Draft);
    // cannot reset if not ValidationFailed
    expect(() => t.resetToDraft()).toThrow('Can only reset validation-failed templates');
  });
});