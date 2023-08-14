import { getEmbedding } from '@/gpt';
import { getRowsForUpdateByRange, getRowsForAllUpdates, DatabaseEmbedding, deleteByEntityName } from '@/db';
import { rangeBuilder } from '@/utils';
import { QueryTypes } from './types';

const embeddingFn = async (doc: DatabaseEmbedding): Promise<void> => {
  try {
    const embeddingText = `${doc.title} ${doc.text}`;
    const { embedding } = await getEmbedding(embeddingText, doc.id);
    doc.embeddings = JSON.stringify(embedding.data[0].embedding);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const buildEmbeddings = async (queryType: string, prompt: string) => {
  if (/^\d+[0-9,-]*$/g.test(prompt)) {
    const range = rangeBuilder(prompt);
    console.log('Going to make embeddings by range:', range);
    const rows = await getRowsForUpdateByRange(DatabaseEmbedding, range, embeddingFn);
    return rows;
  }
  if (prompt === 'all') {
    console.log(`Going to prepare all embeddings for ${queryType}`);
    const rows = await getRowsForAllUpdates(DatabaseEmbedding, embeddingFn, undefined, 'embeddings');
    return rows;
  }
  throw new Error('Only numbers, comma and dash allowed!');
};

export const deleteEntities = (prompt: QueryTypes) => {
  if (Object.values(QueryTypes).includes(prompt)) {
    return deleteByEntityName(prompt);
  }
};
