import { ValidationIssue as PrismaValidationIssue, IssueSeverity, IssueType } from '@prisma/client';
import { Phase } from '@/shared/types/enums';

export class ValidationIssueEntity {
  private constructor(
    public readonly id: string,
    public readonly templateId: string,
    public readonly workflowId: string | null,
    public readonly nodeId: string | null,
    public severity: IssueSeverity,
    public type: IssueType,
    public message: string,
    public details: any,
    public readonly createdAt: Date,
    public resolvedAt: Date | null
  ) {}

  static createPhaseInvalid(
    templateId: string,
    workflowId: string,
    nodeId: string,
    details: {
      nodePhase: Phase;
      allowedPhases: Phase[];
      nodeName: string;
      workflowName: string;
    }
  ): ValidationIssueEntity {
    return new ValidationIssueEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      templateId,
      workflowId,
      nodeId,
      IssueSeverity.error,
      IssueType.phase_invalid,
      `Node "${details.nodeName}" has phase "${details.nodePhase}" which is not allowed in workflow "${details.workflowName}". Allowed phases: ${details.allowedPhases.join(', ')}`,
      details,
      new Date(),
      null
    );
  }

  static createOrphanedNode(
    templateId: string,
    workflowId: string,
    nodeId: string,
    nodeName: string
  ): ValidationIssueEntity {
    return new ValidationIssueEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      templateId,
      workflowId,
      nodeId,
      IssueSeverity.warning,
      IssueType.orphaned_node,
      `Node "${nodeName}" has no dependencies (isolated)`,
      { nodeName },
      new Date(),
      null
    );
  }

  static createMissingDocType(
    templateId: string,
    workflowId: string,
    nodeId: string,
    docTypeId: string
  ): ValidationIssueEntity {
    return new ValidationIssueEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      templateId,
      workflowId,
      nodeId,
      IssueSeverity.error,
      IssueType.missing_doctype,
      `Referenced DocType "${docTypeId}" does not exist`,
      { docTypeId },
      new Date(),
      null
    );
  }

  static createWorkflowEmpty(
    templateId: string,
    workflowId: string,
    workflowName: string
  ): ValidationIssueEntity {
    return new ValidationIssueEntity(
      globalThis.crypto?.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID(),
      templateId,
      workflowId,
      null,
      IssueSeverity.warning,
      IssueType.workflow_empty,
      `Workflow "${workflowName}" has no nodes`,
      { workflowName },
      new Date(),
      null
    );
  }

  static fromPrisma(prisma: PrismaValidationIssue): ValidationIssueEntity {
    return new ValidationIssueEntity(
      prisma.id,
      prisma.templateId,
      prisma.workflowId ?? null,
      prisma.nodeId ?? null,
      prisma.severity,
      prisma.type,
      prisma.message,
      prisma.details,
      prisma.createdAt,
      prisma.resolvedAt ?? null
    );
  }

  isResolved(): boolean {
    return this.resolvedAt !== null;
  }

  resolve(): void {
    if (this.resolvedAt !== null) {
      throw new Error('Issue is already resolved');
    }
    (this as any).resolvedAt = new Date();
  }

  isError(): boolean {
    return this.severity === IssueSeverity.error;
  }

  isWarning(): boolean {
    return this.severity === IssueSeverity.warning;
  }

  toPrisma(): Omit<PrismaValidationIssue, 'createdAt'> & { createdAt?: Date } {
    return {
      id: this.id,
      templateId: this.templateId,
      workflowId: this.workflowId ?? undefined,
      nodeId: this.nodeId ?? undefined,
      severity: this.severity,
      type: this.type,
      message: this.message,
      details: this.details,
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt ?? undefined
    };
  }

  toJSON() {
    return {
      id: this.id,
      templateId: this.templateId,
      workflowId: this.workflowId,
      nodeId: this.nodeId,
      severity: this.severity,
      type: this.type,
      message: this.message,
      details: this.details,
      createdAt: this.createdAt.toISOString(),
      resolvedAt: this.resolvedAt?.toISOString() ?? null
    };
  }
}