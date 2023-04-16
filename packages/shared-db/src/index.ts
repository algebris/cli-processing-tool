import 'reflect-metadata'
import * as dotenv from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const envPath = path.resolve(`${process.cwd()}/../`, '.env');
dotenv.config({ path: envPath });

export const OrmDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt((process.env.PG_PORT || '5432'), 10),
  username: process.env.PG_USER_NAME || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'postgres',
  entities: [__dirname + '/models/**/*.entity{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.NODE_ENV !== 'production',
  dropSchema: false,
} as DataSourceOptions);

export * from './models';
