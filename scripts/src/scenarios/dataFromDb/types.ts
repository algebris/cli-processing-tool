export interface GetEntityByIdOptions {
  dumpTemplate: boolean;
}

export enum QueryTypes {
  Boat = 'boat',
  Shipyard = 'shipyard',
  Category = 'category',
}

export interface EntityProcessorOptions {
  id: number;
  all: boolean;
  build: string;
  query: boolean;
  delete: boolean;
  rewriteDb: boolean;
}
