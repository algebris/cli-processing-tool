import {Client} from 'pg';
import { client, ssh } from './db';
import Cursor from 'pg-cursor';

const query = `
  SELECT
    "boat".id,
    "boat".type,
    "boat".company_id,
    "company_shipyard".name as "shipyard_name",
    "boat".name_en,
    "boat".year_from,
    "boat".year_to,
    "boat".price_id,
    "boat".is_discontinued,
    "boat".is_best,
    "boat".is_vintage,
    "boat".is_published,
    "boat".boat_characteristics_id,
    "boat".model_categories_ids,
    "boat".model_categories_ids[1] as "main_category",
    "boat".alias,
    "boat".description_en,
    "boat_characteristics".*,
    "price".*,
    "model_category".*
  FROM "boat"
  LEFT OUTER JOIN "company_shipyard"
    ON "boat"."company_id" = "company_shipyard"."id"
  LEFT OUTER JOIN "boat_characteristics"
    ON "boat"."boat_characteristics_id" = "boat_characteristics"."id"
  LEFT OUTER JOIN "price"
    ON "boat"."price_id" = "price"."id"
  LEFT OUTER JOIN "model_category"
    ON "boat".model_categories_ids[$1] = "model_category"."id"
  WHERE
    "public"."boat"."is_published" = TRUE AND
    "public"."company_shipyard"."is_published" = TRUE AND
    "public"."company_shipyard"."country_id" <> $2 AND
    "public"."company_shipyard"."name" = $3
`;

const CHUNK_SIZE=100;

async function run() {
  const dbc = await client;
  await doQuery1(dbc);
  // await descripbeTable(dbc, 'company_shipyard');
  dbc.end();
  ssh.close();
}

const descripbeTable = async (dbc: Client, name: string) => {
  const text1 = `SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  is_nullable,
  table_name
FROM 
  information_schema.columns
WHERE 
  table_name = $1;`;
  let {rows} = await dbc.query(text1, [name]);
  console.log('Table: ', name);
  rows.forEach(row => console.log(`${row.column_name} : ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})`: ''} ${row.is_nullable ? 'NULLABLE':''}`));
};

const doQuery2 = async (dbc: Client) => {
  const test1 = 'SELECT * from company_shipyard WHERE company_shipyard.id = 540';
  let rows = await dbc.query(test1);
  console.log(rows);
};

const doQuery1 = async (dbc: Client) => {
  const cursor = dbc.query(new Cursor(query, [1, 183, 'Marlow']));
  let rows = await cursor.read(5);
  const data = rows.map(row => ({
    id: row.id, 
    type: row.type,
    shipyard_name: row.shipyard_name,
    name: row.name_en,
    companyId: row.company_id,
    alias: row.alias,
    title: row.title_en,
  }));
  console.log(data);
}

run();

