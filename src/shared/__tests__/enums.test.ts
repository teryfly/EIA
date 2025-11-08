import { describe, it, expect } from 'vitest';
import {
  Phase,
  NodeStatus,
  isPhase,
  isNodeStatus,
  isDocumentStatus,
  isAIDraftStatus,
  isUserRole,
  isEdgeType,
  isAlertStatus,
  isImpactLevel,
  isIssueSeverity,
  isIssueType,
  isPrerequisiteType,
  isSourceRelationship,
  comparePhases,
  compareNodeStatus,
  PhaseOrder,
  NodeStatusOrder,
  ImpactLevel,
  SourceRelationship,
} from '../types/enums';

describe('Enum Type Guards', () => {
  describe('isPhase', () => {
    it('should return true for valid Phase values', () => {
      expect(isPhase('Inception')).toBe(true);
      expect(isPhase('Elaboration')).toBe(true);
      expect(isPhase('Construction')).toBe(true);
      expect(isPhase('Transition')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isPhase('InvalidPhase')).toBe(false);
      expect(isPhase('')).toBe(false);
      expect(isPhase(null)).toBe(false);
      expect(isPhase(undefined)).toBe(false);
      expect(isPhase(123)).toBe(false);
      expect(isPhase({})).toBe(false);
    });
  });

  describe('isNodeStatus', () => {
    it('should return true for valid NodeStatus values', () => {
      expect(isNodeStatus('locked')).toBe(true);
      expect(isNodeStatus('available')).toBe(true);
      expect(isNodeStatus('in_progress')).toBe(true);
      expect(isNodeStatus('ready')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isNodeStatus('completed')).toBe(false);
      expect(isNodeStatus('')).toBe(false);
      expect(isNodeStatus(null)).toBe(false);
    });
  });

  describe('isDocumentStatus', () => {
    it('should return true for valid DocumentStatus values', () => {
      expect(isDocumentStatus('draft')).toBe(true);
      expect(isDocumentStatus('completed')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isDocumentStatus('pending')).toBe(false);
      expect(isDocumentStatus(null)).toBe(false);
    });
  });

  describe('isAIDraftStatus', () => {
    it('should return true for valid AIDraftStatus values', () => {
      expect(isAIDraftStatus('pending')).toBe(true);
      expect(isAIDraftStatus('accepted')).toBe(true);
      expect(isAIDraftStatus('previously_used')).toBe(true);
      expect(isAIDraftStatus('rejected')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isAIDraftStatus('draft')).toBe(false);
      expect(isAIDraftStatus(null)).toBe(false);
    });
  });

  describe('isUserRole', () => {
    it('should return true for valid UserRole values', () => {
      expect(isUserRole('admin')).toBe(true);
      expect(isUserRole('project_manager')).toBe(true);
      expect(isUserRole('developer')).toBe(true);
      expect(isUserRole('reviewer')).toBe(true);
      expect(isUserRole('viewer')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isUserRole('superadmin')).toBe(false);
      expect(isUserRole(null)).toBe(false);
    });
  });

  describe('isImpactLevel', () => {
    it('should return true for valid ImpactLevel values', () => {
      expect(isImpactLevel('major')).toBe(true);
      expect(isImpactLevel('moderate')).toBe(true);
      expect(isImpactLevel('minor')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isImpactLevel('critical')).toBe(false);
      expect(isImpactLevel(null)).toBe(false);
    });
  });

  describe('isSourceRelationship', () => {
    it('should return true for valid SourceRelationship values', () => {
      expect(isSourceRelationship('derives_from')).toBe(true);
      expect(isSourceRelationship('references')).toBe(true);
      expect(isSourceRelationship('extends')).toBe(true);
      expect(isSourceRelationship('requires')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isSourceRelationship('depends_on')).toBe(false);
      expect(isSourceRelationship(null)).toBe(false);
    });
  });
});

describe('Enum Helper Functions', () => {
  describe('PhaseOrder', () => {
    it('should have correct ordering', () => {
      expect(PhaseOrder[Phase.Inception]).toBe(1);
      expect(PhaseOrder[Phase.Elaboration]).toBe(2);
      expect(PhaseOrder[Phase.Construction]).toBe(3);
      expect(PhaseOrder[Phase.Transition]).toBe(4);
    });
  });

  describe('comparePhases', () => {
    it('should return -1 when first phase is earlier', () => {
      expect(comparePhases(Phase.Inception, Phase.Elaboration)).toBe(-1);
      expect(comparePhases(Phase.Elaboration, Phase.Construction)).toBe(-1);
      expect(comparePhases(Phase.Construction, Phase.Transition)).toBe(-1);
    });

    it('should return 0 when phases are equal', () => {
      expect(comparePhases(Phase.Inception, Phase.Inception)).toBe(0);
      expect(comparePhases(Phase.Elaboration, Phase.Elaboration)).toBe(0);
    });

    it('should return 1 when first phase is later', () => {
      expect(comparePhases(Phase.Elaboration, Phase.Inception)).toBe(1);
      expect(comparePhases(Phase.Transition, Phase.Construction)).toBe(1);
    });
  });

  describe('NodeStatusOrder', () => {
    it('should have correct ordering', () => {
      expect(NodeStatusOrder[NodeStatus.locked]).toBe(1);
      expect(NodeStatusOrder[NodeStatus.available]).toBe(2);
      expect(NodeStatusOrder[NodeStatus.in_progress]).toBe(3);
      expect(NodeStatusOrder[NodeStatus.ready]).toBe(4);
    });
  });

  describe('compareNodeStatus', () => {
    it('should return -1 when first status is earlier', () => {
      expect(compareNodeStatus(NodeStatus.locked, NodeStatus.available)).toBe(-1);
      expect(compareNodeStatus(NodeStatus.available, NodeStatus.in_progress)).toBe(-1);
      expect(compareNodeStatus(NodeStatus.in_progress, NodeStatus.ready)).toBe(-1);
    });

    it('should return 0 when statuses are equal', () => {
      expect(compareNodeStatus(NodeStatus.locked, NodeStatus.locked)).toBe(0);
      expect(compareNodeStatus(NodeStatus.ready, NodeStatus.ready)).toBe(0);
    });

    it('should return 1 when first status is later', () => {
      expect(compareNodeStatus(NodeStatus.available, NodeStatus.locked)).toBe(1);
      expect(compareNodeStatus(NodeStatus.ready, NodeStatus.in_progress)).toBe(1);
    });
  });
});