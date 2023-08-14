import { Client } from 'pg';
import Cursor from 'pg-cursor';
import { readFile } from '@/utils';
import { QUERIES_PATH, CURSOR_BATCH_SIZE, REPLACE_TOKEN } from './config';

export const boatQueryString = readFile(`${QUERIES_PATH}/modelsQuery.sql`);
export const boatQueryParams = [1, 183];
export const shipyardQueryString = readFile(`${QUERIES_PATH}/shipyardQuery.sql`);
export const shipyardQueryParams = [183];
export const categoryQueryString = readFile(`${QUERIES_PATH}/categories.sql`);

export const boatModelById = async (dbc: Client, id: number): Promise<any> => {
  const queryById = boatQueryString.replace(REPLACE_TOKEN, 'AND "public"."boat"."id" = $3');
  const row = await dbc.query(queryById, [...boatQueryParams, id]);
  const data = row.rows[0];

  return data;
};

export const shipyardModelById = async (dbc: Client, id: number): Promise<any> => {
  const queryById = shipyardQueryString.replace(REPLACE_TOKEN, 'AND "public"."company_shipyard"."id" = $2');
  const row = await dbc.query(queryById, [...shipyardQueryParams, id]);
  const data = row.rows[0];

  return data;
};

export const modelCategoryById = async (dbc: Client, categoryId: number): Promise<any> => {
  const queryById = categoryQueryString.replace(REPLACE_TOKEN, 'WHERE model_category.id = $1');
  const row = await dbc.query(queryById, [categoryId]);
  const data = row.rows[0];

  return data;
};

export const modelAllCategories = (dbc: Client) => dbc.query(categoryQueryString);

interface SaveAllTemplatesToDbCallback {
  (batch: any[]): void;
}

export const cursorReader = async (
  dbc: Client,
  query: string,
  params: any[],
  callback: SaveAllTemplatesToDbCallback
): Promise<void> => {
  const cursor = dbc.query(new Cursor(query, params));
  let batch;

  console.time('dbsave');
  do {
    batch = await cursor.read(CURSOR_BATCH_SIZE);
    if (!batch.length) {
      break;
    }
    await callback(batch);
  } while (batch.length);
  console.timeEnd('dbsave');
};
