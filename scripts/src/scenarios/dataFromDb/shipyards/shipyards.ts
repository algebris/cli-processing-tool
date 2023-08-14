import path from 'node:path';
import { Client } from 'pg';
import {
  shipyardModelById,
  DatabaseEmbedding,
  cursorReader,
  shipyardQueryString,
  shipyardQueryParams,
  saveTemplateToDb,
  InsertResult,
} from '@/db';
import { mapTemplateData, mapDatabaseEmbeddingData } from './shipyards.dtd';
import { GetEntityByIdOptions } from '../types';
import { ShipyardRowData, ShipyardTemplateData } from './types';
import { plural, renderTemplate } from '../utils';

export const getShipyardById = async (
  dbc: Client,
  id: number,
  opts: GetEntityByIdOptions
): Promise<Partial<DatabaseEmbedding>> => {
  const shipyardModel = await shipyardModelById(dbc, id);
  if (!shipyardModel) {
    throw new Error(`Shipyard not found by id: ${id}`);
  }
  const data = await getShipyardTemplateData(shipyardModel);
  const shipyardTemplateData = mapTemplateData(shipyardModel);

  if (opts.dumpTemplate) {
    printShipyardTemplate({
      shipyardModel,
      shipyardTemplateData,
      templateText: data.text || '',
    });
  }
  return data;
};

const getShipyardTemplateData = async (shipyardModel: ShipyardRowData): Promise<Partial<DatabaseEmbedding>> => {
  let templateText = '';
  const shipyardTemplateData = mapTemplateData(shipyardModel);
  const templatePath = path.resolve(`${__dirname}/../templates/shipyard.ejs`);

  try {
    templateText = await renderTemplate(templatePath, { ...shipyardTemplateData, plural });
  } catch (err) {
    console.error(`Error rendering template with ID=${shipyardModel.id}`);
    console.error(shipyardTemplateData); //TODO: Handle Errors more evenly
    console.error(err);
  }

  return mapDatabaseEmbeddingData(shipyardModel, templateText);
};

export const saveAllShipyardsToDb = async (dbc: Client): Promise<void> => {
  return cursorReader(dbc, shipyardQueryString, shipyardQueryParams, async (batch) => {
    const batchData: Partial<DatabaseEmbedding>[] = [];
    for (const batchItem of batch) {
      const row = await getShipyardTemplateData(batchItem);
      batchData.push(row);
    }
    batchData.length && console.log('Batch size:', batchData.length);
    const result = await saveTemplateToDb(batchData);
    result.raw && console.log(`Inserted ${result.raw.length || 0}`);
    return result;
  });
};

interface printShipyardTemplateOptions {
  shipyardModel: ShipyardRowData;
  shipyardTemplateData: ShipyardTemplateData;
  templateText: string;
}

export const printShipyardTemplate = async (opts: printShipyardTemplateOptions): Promise<void> => {
  const { shipyardModel, shipyardTemplateData, templateText } = opts;

  console.log('-'.repeat(28), 'QUERY RESULT', '-'.repeat(28));
  console.log(shipyardModel);
  console.log('-'.repeat(28), 'MAP QUERY TO TEMPLATE DATA', '-'.repeat(28));
  console.log(shipyardTemplateData);
  console.log('-'.repeat(28), 'RENDER TEMPLATE DATA', '-'.repeat(28));
  console.log(templateText);
};
