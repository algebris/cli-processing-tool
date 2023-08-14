import path from 'node:path';
import { Client } from 'pg';
import {
  boatModelById,
  DatabaseEmbedding,
  cursorReader,
  boatQueryString,
  boatQueryParams,
  saveTemplateToDb,
} from '@/db';
import { BoatTemplateData, BoatModelTemplateMap, BoatModelType, BoatRowData } from './types';
import { GetEntityByIdOptions } from '../types';
import { mapTemplateData, mapDatabaseEmbeddingData } from './boats.dtd';
import { renderTemplate } from '../utils';

export const pickTemplateByTypeId = (typeId: number): string => {
  const template = BoatModelTemplateMap[typeId as BoatModelType];
  if (!template) {
    throw new Error(`Template not found for type id: ${typeId}`);
  }
  const templatePath = path.resolve(`${__dirname}/../templates/${template}`);

  return templatePath;
};

export const getBoatById = async (
  dbc: Client,
  id: number,
  opts: GetEntityByIdOptions
): Promise<Partial<DatabaseEmbedding>> => {
  const boatModel = await boatModelById(dbc, id);
  if (!boatModel) {
    throw new Error(`Boat with id=${id} not found in DB`);
  }
  const data = await getBoatTemplateData(boatModel);

  if (opts.dumpTemplate) {
    printBoatTemplate({ boatModel, boatTemplateData: mapTemplateData(boatModel), templateText: data.text || '' });
  }
  return data;
};

const getBoatTemplateData = async (boatModel: BoatRowData): Promise<Partial<DatabaseEmbedding>> => {
  const boatTemplateData = mapTemplateData(boatModel);
  const template = pickTemplateByTypeId(boatModel.type);
  const templateText = await renderTemplate(template, boatTemplateData);

  return mapDatabaseEmbeddingData(boatModel, templateText);
};

export const saveAllBoatsToDb = async (dbc: Client): Promise<void> => {
  return cursorReader(dbc, boatQueryString, boatQueryParams, async (batch) => {
    const batchData: Partial<DatabaseEmbedding>[] = [];
    for (const batchItem of batch) {
      const row = await getBoatTemplateData(batchItem);
      batchData.push(row);
    }
    console.log('Batch size:', batchData.length);
    const result = await saveTemplateToDb(batchData);
    console.log(`Inserted ${result.raw.length} rows`);
    return result;
  });
};

interface printBoatTemplateOptions {
  boatModel: BoatRowData;
  boatTemplateData: BoatTemplateData;
  templateText: string;
}

export const printBoatTemplate = (opts: printBoatTemplateOptions): void => {
  const { boatModel, boatTemplateData, templateText } = opts;

  console.log('-'.repeat(28), 'QUERY RESULT', '-'.repeat(28));
  console.log(boatModel);
  console.log('-'.repeat(28), 'MAP QUERY TO TEMPLATE DATA', '-'.repeat(28));
  console.log(boatTemplateData);
  console.log('-'.repeat(28), 'RENDER TEMPLATE DATA', '-'.repeat(28));
  console.log('Template applied:', BoatModelTemplateMap[boatModel.type as BoatModelType]);
  console.log(templateText);
};
