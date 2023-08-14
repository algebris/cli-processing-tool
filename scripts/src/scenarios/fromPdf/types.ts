import { PDFBlock } from '@/pdf';

export interface Block extends PDFBlock {
  tokens: number;
  summary: string;
}

export interface SaveTemplateToDbOptions {
  rewriteDb: boolean;
}
