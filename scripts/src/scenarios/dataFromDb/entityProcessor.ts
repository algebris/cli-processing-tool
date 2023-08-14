/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client } from 'pg';
import {
  DatabaseEmbedding,
  wrapDbConnect,
  saveTemplateToDb,
  DocumentEmbedding,
  SaveTemplateToDbOptions,
  InsertResult,
} from '@/db';
import { EntityProcessorOptions, GetEntityByIdOptions, QueryTypes } from './types';
import { getBoatById, saveAllBoatsToDb } from './boats';
import { getShipyardById, saveAllShipyardsToDb } from './shipyards';
import { getCategoryById, saveAllCategoriesToDb } from './categories';

export interface IEntityProcessor {
  getEntityById(dbc: Client, id: number, opts: GetEntityByIdOptions): Promise<Partial<DatabaseEmbedding>>;
  saveTemplateToDb(
    data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
    opts?: SaveTemplateToDbOptions
  ): Promise<InsertResult>;
  saveAllEntitiesToDb(dbc: Client): Promise<InsertResult | void>;
}

class BoatProcessor implements IEntityProcessor {
  getEntityById(dbc: Client, id: number, opts: GetEntityByIdOptions): Promise<Partial<DatabaseEmbedding>> {
    return getBoatById(dbc, id, opts);
  }

  saveTemplateToDb(
    data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
    opts?: SaveTemplateToDbOptions
  ): Promise<InsertResult> {
    return saveTemplateToDb(data, opts);
  }

  saveAllEntitiesToDb(dbc: Client): Promise<InsertResult | void> {
    return saveAllBoatsToDb(dbc);
  }
}

class ShipyardProcessor implements IEntityProcessor {
  getEntityById(dbc: Client, id: number, opts: GetEntityByIdOptions): Promise<Partial<DatabaseEmbedding>> {
    return getShipyardById(dbc, id, opts);
  }

  saveTemplateToDb(
    data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
    opts?: SaveTemplateToDbOptions
  ): Promise<InsertResult> {
    return saveTemplateToDb(data, opts);
  }

  saveAllEntitiesToDb(dbc: Client): Promise<InsertResult | void> {
    return saveAllShipyardsToDb(dbc);
  }
}

class CategoryProcessor implements IEntityProcessor {
  getEntityById(dbc: Client, id: number, opts: GetEntityByIdOptions): Promise<Partial<DatabaseEmbedding>> {
    return getCategoryById(dbc, id, opts);
  }

  saveTemplateToDb(
    data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
    opts?: SaveTemplateToDbOptions
  ): Promise<InsertResult> {
    throw new Error('Save operation not supported for Category');
  }

  saveAllEntitiesToDb(dbc: Client): Promise<InsertResult | void> {
    return saveAllCategoriesToDb(dbc);
  }
}

export class EntityProcessorFactory {
  createEntityProcessor(queryType: QueryTypes, options: EntityProcessorOptions): IEntityProcessor {
    switch (queryType) {
      case QueryTypes.Boat:
        return new BoatProcessor();
      case QueryTypes.Shipyard:
        return new ShipyardProcessor();
      case QueryTypes.Category:
        return new CategoryProcessor();
      default:
        throw new Error(`EntityProcessor not implemented for query type: ${queryType}`);
    }
  }
}

export class EntityProcessor {
  options: EntityProcessorOptions;
  processor: IEntityProcessor;

  constructor(options: EntityProcessorOptions, processor: IEntityProcessor) {
    this.options = options;
    this.processor = processor;
  }

  async process() {
    return wrapDbConnect(async (dbc: Client) => {
      if (this.options.id) {
        const dumpTemplate = !!this.options.query;
        const rewriteDb = !!this.options.rewriteDb;

        const templ = await this.processor.getEntityById(dbc, this.options.id, { dumpTemplate });

        if (!dumpTemplate && this.processor.saveTemplateToDb) {
          const result = await this.processor.saveTemplateToDb(templ, { rewriteDb });
          console.log(result);
        }
      }
      if (this.options.all) {
        await this.processor.saveAllEntitiesToDb(dbc);
      }
    });
  }
}
