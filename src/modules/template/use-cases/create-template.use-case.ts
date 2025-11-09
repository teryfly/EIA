import { RUPTemplate } from '../domain/aggregates/rup-template';
import { TemplateConfigEntity } from '../domain/entities/template-config.entity';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateCategory } from '@prisma/client';

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: TemplateCategory;
  estimatedDuration?: string;
}
export interface CreateTemplateOutput {
  templateId: string;
  name: string;
  category: TemplateCategory;
  status: string;
}

export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    this.validateInput(input);
    const dup = await this.templateRepository.findByName(input.name);
    if (dup.length > 0) throw new Error(`Template with name "${input.name}" already exists`);
    const template = RUPTemplate.create({
      name: input.name,
      description: input.description,
      category: input.category,
      estimatedDuration: input.estimatedDuration
    });
    const config = TemplateConfigEntity.createDefault(template.id);
    await this.templateRepository.save(template);
    await this.templateRepository.saveConfig(config);
    return { templateId: template.id, name: template.name, category: template.category, status: template.status };
  }

  private validateInput(input: CreateTemplateInput): void {
    if (!input.name || input.name.trim().length === 0) throw new Error('Template name is required');
    if (input.name.length < 2 || input.name.length > 100) throw new Error('Template name must be between 2 and 100 characters');
    if (!Object.values(TemplateCategory).includes(input.category)) throw new Error('Invalid template category');
  }
}