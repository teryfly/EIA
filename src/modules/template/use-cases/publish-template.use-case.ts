import { TemplateValidationService } from '../domain/services/template-validation.service';
import { TemplateRepository } from '../repositories/template.repository';

export interface PublishTemplateInput { templateId: string; }
export interface PublishTemplateOutput {
  templateId: string;
  name: string;
  status: string;
  publishedAt: Date;
}

export class PublishTemplateUseCase {
  constructor(
    private readonly validationService: TemplateValidationService,
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(input: PublishTemplateInput): Promise<PublishTemplateOutput> {
    const template = await this.templateRepository.findById(input.templateId);
    if (!template) throw new Error(`Template ${input.templateId} not found`);
    if (!template.canPublish()) throw new Error('Template must be in Draft status to publish');
    const report = await this.validationService.validateTemplate(input.templateId);
    if (!report.valid) {
      throw new Error(`Cannot publish template with validation errors. Found ${report.getErrorCount()} errors. Please fix all errors before publishing.`);
    }
    template.publish(report);
    await this.templateRepository.save(template);
    return { templateId: template.id, name: template.name, status: template.status, publishedAt: template.updatedAt };
  }
}