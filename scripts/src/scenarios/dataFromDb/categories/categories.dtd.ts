import { getTokensCount } from '@/gpt';
import { CategoryRowData } from './types';
import { DatabaseEmbedding, EntityType } from '@/db';

export const mapDatabaseEmbeddingData = (model: CategoryRowData, text: string): Partial<DatabaseEmbedding> => ({
  entityId: model.id,
  entityType: EntityType.Category,
  title: model.title_en,
  text,
  textLength: text.length,
  tokens: getTokensCount(`${model.title_en} ${text}`),
});
