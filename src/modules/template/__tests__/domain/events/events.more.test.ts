import { describe, it, expect } from 'vitest';
import {
  TemplateCreatedEvent,
  TemplatePublishedEvent,
  TemplateArchivedEvent,
  WorkflowAddedEvent,
  WorkflowUpdatedEvent,
  NodeAddedEvent,
  NodeUpdatedEvent
} from '../../../domain/events';

describe('Domain Events - index export and toJSON', () => {
  it('TemplateCreatedEvent toJSON contains fields', () => {
    const e = new TemplateCreatedEvent('tid', 'tname', 'Custom' as any);
    const j = e.toJSON();
    expect(j.eventType).toBe('TemplateCreated');
    expect(j.templateId).toBe('tid');
    expect(j.category).toBe('Custom');
  });

  it('TemplatePublishedEvent toJSON contains fields', () => {
    const e = new TemplatePublishedEvent('tid', 'tname');
    const j = e.toJSON();
    expect(j.eventType).toBe('TemplatePublished');
    expect(j.templateName).toBe('tname');
  });

  it('TemplateArchivedEvent toJSON contains fields', () => {
    const e = new TemplateArchivedEvent('tid', 'tname');
    const j = e.toJSON();
    expect(j.eventType).toBe('TemplateArchived');
    expect(j.templateId).toBe('tid');
  });

  it('WorkflowAddedEvent toJSON contains fields', () => {
    const e = new WorkflowAddedEvent('wid', 'tid', 'wname', 'code');
    const j = e.toJSON();
    expect(j.eventType).toBe('WorkflowAdded');
    expect(j.workflowCode).toBe('code');
    expect(j.templateId).toBe('tid');
  });

  it('WorkflowUpdatedEvent toJSON contains fields', () => {
    const e = new WorkflowUpdatedEvent('wid', 'tid');
    const j = e.toJSON();
    expect(j.eventType).toBe('WorkflowUpdated');
    expect(j.workflowId).toBe('wid');
  });

  it('NodeAddedEvent toJSON contains fields', () => {
    const e = new NodeAddedEvent('nid', 'wid', 'wid.nid', 'nName');
    const j = e.toJSON();
    expect(j.eventType).toBe('NodeAdded');
    expect(j.fullId).toBe('wid.nid');
    expect(j.nodeName).toBe('nName');
  });

  it('NodeUpdatedEvent toJSON contains fields', () => {
    const e = new NodeUpdatedEvent('nid', 'wid', 'wid.nid');
    const j = e.toJSON();
    expect(j.eventType).toBe('NodeUpdated');
    expect(j.fullId).toBe('wid.nid');
  });
});