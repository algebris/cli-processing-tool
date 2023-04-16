import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';
import { AuthGoogleModule } from './auth-google/auth.module';
import { DataSource } from './database/database.providers';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

import { GoogleStrategy } from './auth-google/strategies/google.strategy';
import { HomeModule } from './home/home.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const envFilePath = path.resolve(`${process.cwd()}/../`, '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
      expandVariables: true,
      envFilePath,
    }),
    TypeOrmModule.forRoot(DataSource.options),
    UserModule,
    AuthGoogleModule,
    HomeModule,
  ],
  providers: [GoogleStrategy],
})
export class AppModule {}
