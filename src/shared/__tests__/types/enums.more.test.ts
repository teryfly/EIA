import { describe, it, expect } from 'vitest';
import {
  Phase,
  NodeStatus,
  DocumentStatus,
  AIDraftStatus,
  AlertStatus,
  UserRole,
  EdgeType,
  ImpactLevel,
  isPhase,
  isNodeStatus,
  isDocumentStatus,
  isAIDraftStatus,
  isUserRole,
  isEdgeType,
  isAlertStatus,
  isImpactLevel,
  PhaseOrder,
  comparePhases,
  NodeStatusOrder,
  compareNodeStatus,
  IssueSeverity,
  IssueType,
  isIssueSeverity,
  isIssueType,
  SourceRelationship,
  isSourceRelationship
} from '@/shared/types/enums';

describe('shared/types/enums - guards and helpers', () => {
  it('type guards return true for valid and false for invalid', () => {
    expect(isPhase(Phase.Inception)).toBe(true);
    expect(isPhase('nope')).toBe(false);

    expect(isNodeStatus(NodeStatus.available)).toBe(true);
    expect(isNodeStatus('x')).toBe(false);

    expect(isDocumentStatus(DocumentStatus.draft)).toBe(true);
    expect(isDocumentStatus(123 as any)).toBe(false);

    expect(isAIDraftStatus(AIDraftStatus.pending)).toBe(true);
    expect(isAIDraftStatus(null as any)).toBe(false);

    expect(isUserRole(UserRole.developer)).toBe(true);
    expect(isUserRole('hacker' as any)).toBe(false);

    expect(isEdgeType(EdgeType.required)).toBe(true);
    expect(isEdgeType('optionalish' as any)).toBe(false);

    expect(isAlertStatus(AlertStatus.open)).toBe(true);
    expect(isAlertStatus(undefined as any)).toBe(false);

    expect(isImpactLevel(ImpactLevel.major)).toBe(true);
    expect(isImpactLevel('low' as any)).toBe(false);

    expect(isIssueSeverity(IssueSeverity.error)).toBe(true);
    expect(isIssueSeverity('critical' as any)).toBe(false);

    expect(isIssueType(IssueType.workflow_empty)).toBe(true);
    expect(isIssueType('whatever' as any)).toBe(false);

    expect(isSourceRelationship(SourceRelationship.extends)).toBe(true);
    expect(isSourceRelationship('binds' as any)).toBe(false);
  });

  it('PhaseOrder and comparePhases behave as expected', () => {
    expect(PhaseOrder[Phase.Inception]).toBe(1);
    expect(comparePhases(Phase.Inception, Phase.Elaboration)).toBe(-1);
    expect(comparePhases(Phase.Construction, Phase.Construction)).toBe(0);
    expect(comparePhases(Phase.Transition, Phase.Construction)).toBe(1);
  });

  it('NodeStatusOrder and compareNodeStatus behave as expected', () => {
    expect(NodeStatusOrder[NodeStatus.locked]).toBe(1);
    expect(compareNodeStatus(NodeStatus.available, NodeStatus.ready)).toBe(-1);
    expect(compareNodeStatus(NodeStatus.ready, NodeStatus.ready)).toBe(0);
    expect(compareNodeStatus(NodeStatus.ready, NodeStatus.in_progress)).toBe(1);
  });
});