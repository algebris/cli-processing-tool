import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { OrmDataSource } from 'shared-db';

const options: Partial<DataSourceOptions> = {
  type: 'postgres',
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  extra: {
    max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '', 10) || 100,
    ssl:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            rejectUnauthorized:
              process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.DATABASE_CA ?? undefined,
            key: process.env.DATABASE_KEY ?? undefined,
            cert: process.env.DATABASE_CERT ?? undefined,
          }
        : undefined,
  },
};

export const DataSource = OrmDataSource.setOptions(options);

// export const DatabaseProviders = [
//   {
//     provide: 'DATA_SOURCE',
//     useFactory: async () => DataSource.initialize(),
//   },
// ];
