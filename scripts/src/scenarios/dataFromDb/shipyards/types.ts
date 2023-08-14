export interface ShipyardRowData {
  id: number;
  name: string;
  megayachts_count: number;
  model_categories: string[];
  models_count: number;
  min_length_oa: string;
  max_length_oa: string;
  series_ids: number[];
  series_names: string[];
  notActualBoatsCount: number | null;
  notActualBoatCategories: string[] | null;
}

export type ShipyardTemplateData = {
  shipyard: string;
  isHaveSuperyachts: boolean;
  actualBoatCategories: string[];
  actualBoatsCount: number;
  actualLoaMin: number | null;
  actualLoaMax: number | null;
  actualBoatSeriesCount: number;
  actualBoatSeries: string[];
  notActualBoatsCount: number | null;
  notActualBoatCategories: string | null;
};
