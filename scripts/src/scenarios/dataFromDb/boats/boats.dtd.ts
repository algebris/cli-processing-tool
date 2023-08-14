import { formatPrice } from '../utils';
import { DatabaseEmbedding, EntityType, BoatDbModelType } from '@/db';
import {
  SeaWorthinesClassList,
  SeaWorthinesClass,
  BoatRowData,
  BoatTemplateData,
  BoatModelDbTypeMap,
  BoatModelType,
} from './types';
import { getTokensCount } from '@/gpt';

const makeBoatTitle = (model: BoatRowData) => `${model.shipyard_name} ${model.name_en}`;

export const mapTemplateData = (model: BoatRowData): BoatTemplateData => ({
  isActualBoat: !model.is_discontinued,
  isPlanning: model.year_from >= new Date().getFullYear(), // is it ok?
  boat: makeBoatTitle(model),
  shipyard: model.shipyard_name || null,
  yearFrom: model.year_from,
  yearTo: model.year_to,
  category: model.title_en,
  loa: parseFloat(model.length_oa),
  cabinsCount: model.cabins_number,
  guestsCount: model.max_seating,
  draft: parseFloat(model.sea_gauge),
  maxSpeed: model.max_speed,
  cruiseSpeed: model.cruising_speed,
  ceCertificate: model.seaworthiness_class
    ? SeaWorthinesClassList[model.seaworthiness_class as SeaWorthinesClass]
    : null,
  price: formatPrice(parseInt(model.value, 10), model.currency),
});

export const mapDatabaseEmbeddingData = (model: BoatRowData, text: string): Partial<DatabaseEmbedding> => ({
  entityId: model.boat_id,
  entityType: EntityType.Boat,
  boatModelType: BoatModelDbTypeMap[model.type as BoatModelType] as BoatDbModelType,
  title: makeBoatTitle(model),
  text,
  textLength: text.length,
  tokens: getTokensCount(`${makeBoatTitle(model)} ${text}`),
});
