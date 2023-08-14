import { Client } from 'pg';
import { convert } from 'html-to-text';
import { mapDatabaseEmbeddingData } from './categories.dtd';
import { modelCategoryById, DatabaseEmbedding, modelAllCategories, saveTemplateToDb, InsertResult } from '@/db';
import { CategoryRowData } from './types';
import { GetEntityByIdOptions } from '../types';

export const getCategoryById = async (
  dbc: Client,
  id: number,
  opts: GetEntityByIdOptions
): Promise<Partial<DatabaseEmbedding>> => {
  const categoryModel = await modelCategoryById(dbc, id);
  if (!categoryModel) {
    throw new Error(`Category not found by id: ${id}`);
  }
  const data = await getCategoryTemplateData(categoryModel);

  if (opts.dumpTemplate) {
    printModelCategoryById(categoryModel, data.text);
  }

  return data;
};

const getCategoryTemplateData = (model: CategoryRowData): Partial<DatabaseEmbedding> => {
  const cleanText = convert(model.description_en, { wordwrap: false });
  return mapDatabaseEmbeddingData(model, cleanText);
};

export const saveAllCategoriesToDb = async (dbc: Client): Promise<InsertResult> => {
  const model = await modelAllCategories(dbc);
  const data = model.rows.map(getCategoryTemplateData);
  return saveTemplateToDb(data);
};

export const printModelCategoryById = (categoryModel: CategoryRowData, text = ''): void => {
  console.log('-'.repeat(28), 'QUERY RESULT', '-'.repeat(28));
  console.log(categoryModel);
  console.log('-'.repeat(28), 'QUERY RESULT', '-'.repeat(28));
  console.log(text);
};
