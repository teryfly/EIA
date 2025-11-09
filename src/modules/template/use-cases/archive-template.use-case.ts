import { TemplateRepository } from '../repositories/template.repository';

export interface ArchiveTemplateInput {
  templateId: string;
}
export interface ArchiveTemplateOutput {
  templateId: string;
  name: string;
  status: string;
  archivedAt: Date;
}

export class ArchiveTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(input: ArchiveTemplateInput): Promise<ArchiveTemplateOutput> {
    const template = await this.templateRepository.findById(input.templateId);
    if (!template) throw new Error(`Template ${input.templateId} not found`);
    template.archive();
    await this.templateRepository.save(template);
    return {
      templateId: template.id,
      name: template.name,
      status: template.status,
      archivedAt: template.updatedAt
    };
  }
}