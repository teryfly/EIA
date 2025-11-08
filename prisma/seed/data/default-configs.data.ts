export interface AIServiceConfigSeedData {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  apiEndpoint: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retryMaxAttempts: number;
  retryDelayMs: number;
  isActive: boolean;
}

export interface ArchivePolicySeedData {
  name: string;
  archiveDaysAfterHandled: number;
  archiveDaysAfterIgnored: number;
  cronExpression: string;
  batchSize: number;
  isActive: boolean;
  retentionDays: number;
  deleteAfterArchive: boolean;
}

export const aiServiceConfigData: AIServiceConfigSeedData = {
  name: 'Default OpenAI Configuration',
  provider: 'openai',
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key',
  apiEndpoint: process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1',
  temperature: 0.7,
  maxTokens: 4000,
  timeoutMs: 60000,
  retryMaxAttempts: 3,
  retryDelayMs: 1000,
  isActive: true,
};

export const archivePolicyData: ArchivePolicySeedData = {
  name: 'Default Archive Policy',
  archiveDaysAfterHandled: 30,
  archiveDaysAfterIgnored: 30,
  cronExpression: '0 2 * * *',
  batchSize: 100,
  isActive: true,
  retentionDays: 365,
  deleteAfterArchive: false,
};