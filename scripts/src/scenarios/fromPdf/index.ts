import { getSummary, getEmbedding } from '@/gpt';
import { convertPdf2Txt } from '@/pdf';
import {
  savePdfToDb,
  getRowsForUpdateByRange,
  getRowsForUpdateByFile,
  getRowsForAllUpdates,
  DocumentEmbedding,
  textIsEmpty,
} from '@/db';
import { pdfFiles } from './utils';
import { rangeBuilder } from '@/utils';
import { SaveTemplateToDbOptions } from './types';

export const convertPdf = async (fileName: string): Promise<Partial<DocumentEmbedding>[]> => {
  const pdf = await convertPdf2Txt(fileName);
  const pdfData = pdf.map(
    (item) =>
      ({
        documentName: fileName,
        documnetType: 'pdf',
        pageNumber: item.page,
        title: item.header,
        rawText: item.content,
        font: item.font.replace(/^.*(f\d+)$/, '$1'),
      } as Partial<DocumentEmbedding>)
  );
  return pdfData;
};

export const processPdf = async (fileName: string, opts: SaveTemplateToDbOptions) => {
  const files = pdfFiles();
  if (!files.includes(fileName)) {
    throw new Error('Given filename not found in /files');
  }
  const blocks = await convertPdf(fileName);
  await savePdfToDb(blocks, opts);
  console.log('Done');
};

export const processAllPdf = async (opts: SaveTemplateToDbOptions) => {
  const files = pdfFiles();
  if (!files.length) {
    throw new Error('No PDF file found');
  }
  for (const file of files) {
    const blocks = await convertPdf(file);
    console.log(`Imported ${blocks.length} blocks from ${file}`);
    await savePdfToDb(blocks, opts);
  }
  console.log('Done');
};

const summary = async (doc: DocumentEmbedding): Promise<void> => {
  try {
    const { tokens, summary, skipped } = await getSummary(doc.rawText, doc.id);
    doc.tokens = tokens;
    doc.processedText = summary;
    doc.isSummarized = !skipped;
    doc.textLength = `${doc.title} ${summary}`.length;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const embedding = async (doc: DocumentEmbedding): Promise<void> => {
  try {
    const { embedding } = await getEmbedding(doc.processedText, doc.id);
    doc.embeddings = JSON.stringify(embedding.data[0].embedding);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const buildSummaries = async (prompt: string, opts: SaveTemplateToDbOptions) => {
  if (pdfFiles().includes(prompt)) {
    console.log(`Going to prepare summaries by filename: ${prompt}`);
    const where = opts.rewriteDb ? undefined : textIsEmpty;
    const rows = await getRowsForUpdateByFile(DocumentEmbedding, prompt, summary, where);
    return rows;
  }
  if (/^\d+[0-9,-]*$/g.test(prompt)) {
    const range = rangeBuilder(prompt);
    console.log('Going to prepare summaries by range:', range);
    const where = opts.rewriteDb ? undefined : textIsEmpty;
    const rows = await getRowsForUpdateByRange(DocumentEmbedding, range, summary, where);
    return rows;
  }
  if (prompt === 'all') {
    console.log('Going to prepare all summaries');
    const where = opts.rewriteDb ? undefined : textIsEmpty;
    const rows = await getRowsForAllUpdates(DocumentEmbedding, summary, where);
    return rows;
  }
  throw new Error('Only numbers, comma and dash allowed!');
};

export const buildPdfEmbeddings = async (prompt: string) => {
  if (pdfFiles().includes(prompt)) {
    console.log(`Going to build embedding by filename: ${prompt}`);
    const rows = await getRowsForUpdateByFile(DocumentEmbedding, prompt, embedding);
    return rows;
  }
  if (/^\d+[0-9,-]*$/g.test(prompt)) {
    const range = rangeBuilder(prompt);
    console.log('Going to make embeddings by range:', range);
    const rows = await getRowsForUpdateByRange(DocumentEmbedding, range, embedding);
    return rows;
  }
  if (prompt === 'all') {
    console.log('Going to prepare all embeddings');
    const rows = await getRowsForAllUpdates(DocumentEmbedding, embedding, undefined, 'embeddings');
    return rows;
  }
  throw new Error('Only numbers, comma and dash allowed!');
};
