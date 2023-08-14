import { BoatDbModelType } from '@/db';

export interface BoatRowData {
  boat_id: number;
  is_discontinued: boolean;
  year_from: number;
  shipyard_name: string | null;
  name_en: string;
  type: number;
  year_to: number;
  title_en: string;
  length_oa: string;
  cabins_number: number;
  max_seating: number;
  sea_gauge: string;
  max_speed: number;
  cruising_speed: number;
  seaworthiness_class: number;
  value: string;
  currency: string;
}

export type BoatTemplateData = {
  isActualBoat: boolean;
  isPlanning: boolean;
  boat: string;
  shipyard: string | null;
  yearFrom: number;
  yearTo?: number | null;
  category: string;
  loa: number;
  cabinsCount: number | null;
  guestsCount: number | null;
  draft: number;
  maxSpeed?: number | null;
  cruiseSpeed?: number | null;
  ceCertificate?: string | null;
  price: string | null;
};

export enum SeaWorthinesClass {
  A = 1,
  B = 2,
  C = 3,
  D = 4,
}

export const SeaWorthinesClassList: Record<SeaWorthinesClass, string> = {
  [SeaWorthinesClass.A]: 'Ocean',
  [SeaWorthinesClass.B]: 'Sea',
  [SeaWorthinesClass.C]: 'Coastline',
  [SeaWorthinesClass.D]: 'Protected waters',
};

export const enum BoatModelType {
  TYPE_MOTOR_YACHT = 1,
  TYPE_SAILING_YACHT = 2,
  TYPE_BOAT = 3,
}

// build hash by boat model type where 1 - boat-motor-yacht.ejs, 2 - boat-sailing-yacht.ejs, 3 - boat-boat.ejs
export const BoatModelTemplateMap: Record<BoatModelType, string> = {
  [BoatModelType.TYPE_MOTOR_YACHT]: 'boat-motor-yacht.ejs',
  [BoatModelType.TYPE_SAILING_YACHT]: 'boat-sailing-yacht.ejs',
  [BoatModelType.TYPE_BOAT]: 'boat-powerboat.ejs',
};

export const BoatModelDbTypeMap: Record<BoatModelType, string> = {
  [BoatModelType.TYPE_MOTOR_YACHT]: BoatDbModelType.MotorYacht,
  [BoatModelType.TYPE_SAILING_YACHT]: BoatDbModelType.SailingYacht,
  [BoatModelType.TYPE_BOAT]: BoatDbModelType.PowerBoat,
};
