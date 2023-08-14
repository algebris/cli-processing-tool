import { TextItem } from 'pdfjs-dist/types/src/display/api';

export interface PDFBlock {
  page: number;
  header: string;
  font: string;
  content: string;
}

interface FilterRule {
  where: 'header' | 'content';
  rule: RegExp;
  page?: number;
}

export interface ParsersType {
  [key: string]: {
    skipPages: number[];
    fonts: {
      [key: string]: string;
    };
    parse: (this: Context, item: TextItem) => void;
    exclude?: FilterRule[];
  };
}

export interface Context {
  content: PDFBlock[];
  currentBlock: PDFBlock;
  pageCount: number;
  exclude?: FilterRule[];
  fonts: {
    [key: string]: string;
  };
}
