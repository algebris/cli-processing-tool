import { getTokensCount } from '@/gpt';
import { DatabaseEmbedding, EntityType } from '@/db';
import { ShipyardTemplateData, ShipyardRowData } from './types';

export const mapTemplateData = (row: ShipyardRowData): ShipyardTemplateData => ({
  shipyard: row.name,
  isHaveSuperyachts: row.megayachts_count > 0,
  actualBoatCategories: row.model_categories,
  actualBoatsCount: row.models_count,
  actualLoaMin: parseFloat(row.min_length_oa) || null,
  actualLoaMax: parseFloat(row.max_length_oa) || null,
  actualBoatSeriesCount: row.series_ids && row.series_ids.length,
  actualBoatSeries: row.series_names,
  notActualBoatsCount: row.notActualBoatsCount,
  notActualBoatCategories: Array.isArray(row.notActualBoatCategories) ? row.notActualBoatCategories.join(', ') : null,
});

export const mapDatabaseEmbeddingData = (model: ShipyardRowData, text: string): Partial<DatabaseEmbedding> => ({
  entityId: model.id,
  entityType: EntityType.Shipyard,
  title: model.name,
  text,
  textLength: text.length,
  tokens: getTokensCount(`${model.name} ${text}`),
});
