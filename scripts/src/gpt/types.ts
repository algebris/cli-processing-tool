export interface Summary {
  tokens: number;
  summary?: string;
  tokens_summary?: number;
}

export enum GptModels {
  Turbo = 'gpt-3.5-turbo',
  DaVinci = 'text-davinci-003',
  Embedding = 'text-embedding-ada-002',
}

export interface GetSummaryOutput {
  tokens: number;
  summary: string;
  skipped: boolean;
}
