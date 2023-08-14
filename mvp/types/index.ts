export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-4"
}

export type PdfDocument = {
  title: string;
  processed_text: string;
  text_length: number;
  tokens: number;
  chunks: DataChunk[];
};

export type DataChunk = {
  title: string;
  text: string;
  text_length: number;
  tokens: number;
  documentName?: string;
  embedding: number[];
  entityId?: number;
};

export type PdfJSON = {
  length: number;
  tokens: number;
  documents: PdfDocument[];
};
