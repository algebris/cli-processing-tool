import 'reflect-metadata'
import * as dotenv from 'dotenv';
import path from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });

export const db = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: parseInt((process.env.PGPORT || '5432'), 10),
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'postgres',
  entities: [__dirname + '/models/**/*.entity{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.NODE_ENV !== 'production',
  dropSchema: false,
  migrations: [`${__dirname}/../migrations/*.{ts,js}`],
  migrationsRun: true
} as DataSourceOptions);


export * from 'typeorm';
export * from './models';
