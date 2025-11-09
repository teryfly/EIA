import { ValidationIssueEntity } from '../entities/validation-issue.entity';

export class ValidationReport {
  constructor(
    public readonly templateId: string,
    public readonly valid: boolean,
    public readonly errors: ValidationIssueEntity[],
    public readonly warnings: ValidationIssueEntity[],
    public readonly createdAt: Date = new Date()
  ) {}

  static createValid(templateId: string): ValidationReport {
    return new ValidationReport(templateId, true, [], []);
  }

  static createInvalid(
    templateId: string,
    errors: ValidationIssueEntity[],
    warnings: ValidationIssueEntity[] = []
  ): ValidationReport {
    return new ValidationReport(templateId, false, errors, warnings);
  }

  getErrors(): ValidationIssueEntity[] {
    return [...this.errors];
  }

  getWarnings(): ValidationIssueEntity[] {
    return [...this.warnings];
  }

  getErrorsByType(type: string): ValidationIssueEntity[] {
    return this.errors.filter((e) => e.type === (type as any));
  }

  hasErrorType(type: string): boolean {
    return this.errors.some((e) => e.type === (type as any));
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getWarningCount(): number {
    return this.warnings.length;
  }

  getSummary(): string {
    if (this.valid) return 'Template validation passed';
    return `Template validation failed: ${this.errors.length} errors, ${this.warnings.length} warnings`;
    }

  toJSON() {
    return {
      templateId: this.templateId,
      valid: this.valid,
      errors: this.errors.map((e) => e.toJSON()),
      warnings: this.warnings.map((w) => w.toJSON()),
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      summary: this.getSummary(),
      createdAt: this.createdAt.toISOString()
    };
  }
}