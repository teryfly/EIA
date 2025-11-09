import { TemplateValidationService } from '../domain/services/template-validation.service';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateStatus } from '@prisma/client';

export interface ValidateTemplateInput { templateId: string; }
export interface ValidateTemplateOutput {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: any[];
  warnings: any[];
  summary: string;
}

export class ValidateTemplateUseCase {
  constructor(
    private readonly validationService: TemplateValidationService,
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(input: ValidateTemplateInput): Promise<ValidateTemplateOutput> {
    const report = await this.validationService.validateTemplate(input.templateId);
    const template = await this.templateRepository.findById(input.templateId);
    if (!template) throw new Error(`Template ${input.templateId} not found`);
    if (!report.valid) {
      template.markValidationFailed();
    } else if (template.status === TemplateStatus.ValidationFailed) {
      template.resetToDraft();
    }
    await this.templateRepository.save(template);
    return {
      valid: report.valid,
      errorCount: report.getErrorCount(),
      warningCount: report.getWarningCount(),
      errors: report.getErrors().map((e) => e.toJSON()),
      warnings: report.getWarnings().map((w) => w.toJSON()),
      summary: report.getSummary()
    };
  }
}