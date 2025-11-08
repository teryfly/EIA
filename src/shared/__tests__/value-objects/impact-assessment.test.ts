import { describe, it, expect } from 'vitest';
import { ImpactLevel, AlertIssueType } from '../../types/enums';
import {
  ImpactAssessmentSchema,
  isImpactAssessment,
  getHighImpactDocuments,
  getMajorImpactDocuments,
  getModerateImpactDocuments,
  getMinorImpactDocuments,
  hasAnyIssues,
  getAffectedNodeCount,
  getAffectedDocumentCount,
  getDocumentsWithIssues,
  getDocumentsByImpactLevel,
  type ImpactAssessment,
  type AssessedDocument,
  type AssessedNode,
} from '../../types/value-objects/impact-assessment';

describe('ImpactAssessment Value Object', () => {
  const doc1: AssessedDocument = {
    documentId: '550e8400-e29b-41d4-a716-446655440001',
    documentName: 'Doc 1',
    impactLevel: ImpactLevel.major,
    issueType: AlertIssueType.RequirementMissing,
    suggestions: 'Add missing requirements',
  };

  const doc2: AssessedDocument = {
    documentId: '550e8400-e29b-41d4-a716-446655440002',
    documentName: 'Doc 2',
    impactLevel: ImpactLevel.moderate,
    suggestions: 'Review and update',
  };

  const doc3: AssessedDocument = {
    documentId: '550e8400-e29b-41d4-a716-446655440003',
    documentName: 'Doc 3',
    impactLevel: ImpactLevel.minor,
    issueType: AlertIssueType.Unclear,
    suggestions: 'Clarify wording',
  };

  const node1: AssessedNode = {
    nodeId: '550e8400-e29b-41d4-a716-446655440011',
    nodeName: 'Node 1',
    overallImpact: ImpactLevel.major,
    documents: [doc1, doc2],
  };

  const node2: AssessedNode = {
    nodeId: '550e8400-e29b-41d4-a716-446655440012',
    nodeName: 'Node 2',
    overallImpact: ImpactLevel.minor,
    documents: [doc3],
  };

  const assessment: ImpactAssessment = {
    summary: 'Significant impact detected',
    needsRegeneration: true,
    hasIssue: true,
    affectedNodes: [node1, node2],
  };

  describe('Schema Validation', () => {
    it('should validate valid impact assessment', () => {
      const result = ImpactAssessmentSchema.safeParse(assessment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid document ID', () => {
      const invalid = {
        ...assessment,
        affectedNodes: [
          {
            ...node1,
            documents: [{ ...doc1, documentId: 'not-a-uuid' }],
          },
        ],
      };
      const result = ImpactAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid impact level', () => {
      const invalid = {
        ...assessment,
        affectedNodes: [
          {
            ...node1,
            documents: [{ ...doc1, impactLevel: 'critical' }],
          },
        ],
      };
      const result = ImpactAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid assessment', () => {
      expect(isImpactAssessment(assessment)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isImpactAssessment(null)).toBe(false);
      expect(isImpactAssessment({})).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    describe('getHighImpactDocuments / getMajorImpactDocuments', () => {
      it('should return documents with major impact', () => {
        const result = getHighImpactDocuments(assessment);
        expect(result).toHaveLength(1);
        expect(result[0].documentName).toBe('Doc 1');
        expect(result[0].impactLevel).toBe(ImpactLevel.major);

        const result2 = getMajorImpactDocuments(assessment);
        expect(result2).toEqual(result);
      });
    });

    describe('getModerateImpactDocuments', () => {
      it('should return documents with moderate impact', () => {
        const result = getModerateImpactDocuments(assessment);
        expect(result).toHaveLength(1);
        expect(result[0].documentName).toBe('Doc 2');
        expect(result[0].impactLevel).toBe(ImpactLevel.moderate);
      });
    });

    describe('getMinorImpactDocuments', () => {
      it('should return documents with minor impact', () => {
        const result = getMinorImpactDocuments(assessment);
        expect(result).toHaveLength(1);
        expect(result[0].documentName).toBe('Doc 3');
        expect(result[0].impactLevel).toBe(ImpactLevel.minor);
      });
    });

    describe('hasAnyIssues', () => {
      it('should return true when assessment has issues', () => {
        expect(hasAnyIssues(assessment)).toBe(true);
      });

      it('should return false when assessment has no issues', () => {
        const noIssues = { ...assessment, hasIssue: false };
        expect(hasAnyIssues(noIssues)).toBe(false);
      });
    });

    describe('getAffectedNodeCount', () => {
      it('should return correct node count', () => {
        expect(getAffectedNodeCount(assessment)).toBe(2);
      });

      it('should return 0 for empty nodes', () => {
        const empty = { ...assessment, affectedNodes: [] };
        expect(getAffectedNodeCount(empty)).toBe(0);
      });
    });

    describe('getAffectedDocumentCount', () => {
      it('should return total document count across all nodes', () => {
        expect(getAffectedDocumentCount(assessment)).toBe(3);
      });

      it('should return 0 for empty nodes', () => {
        const empty = { ...assessment, affectedNodes: [] };
        expect(getAffectedDocumentCount(empty)).toBe(0);
      });
    });

    describe('getDocumentsWithIssues', () => {
      it('should return only documents with issue types', () => {
        const result = getDocumentsWithIssues(assessment);
        expect(result).toHaveLength(2);
        expect(result.map((d) => d.documentName)).toEqual(['Doc 1', 'Doc 3']);
        expect(result.every((d) => d.issueType !== undefined)).toBe(true);
      });
    });

    describe('getDocumentsByImpactLevel', () => {
      it('should group documents by impact level', () => {
        const result = getDocumentsByImpactLevel(assessment);
        expect(result[ImpactLevel.major]).toHaveLength(1);
        expect(result[ImpactLevel.moderate]).toHaveLength(1);
        expect(result[ImpactLevel.minor]).toHaveLength(1);
        expect(result[ImpactLevel.major][0].documentName).toBe('Doc 1');
        expect(result[ImpactLevel.moderate][0].documentName).toBe('Doc 2');
        expect(result[ImpactLevel.minor][0].documentName).toBe('Doc 3');
      });
    });
  });
});