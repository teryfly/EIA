import { TemplateRepository } from '../repositories/template.repository';

export interface UpdateTemplateInput {
  templateId: string;
  name?: string;
  description?: string;
  estimatedDuration?: string;
}
export interface UpdateTemplateOutput {
  templateId: string;
  name: string;
  updatedAt: Date;
}

export class UpdateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(input: UpdateTemplateInput): Promise<UpdateTemplateOutput> {
    const template = await this.templateRepository.findById(input.templateId);
    if (!template) throw new Error(`Template ${input.templateId} not found`);
    if (!template.canEdit()) throw new Error('Cannot edit this template (published standard template or archived)');
    template.update({ name: input.name, description: input.description, estimatedDuration: input.estimatedDuration });
    await this.templateRepository.save(template);
    return { templateId: template.id, name: template.name, updatedAt: template.updatedAt };
  }
}