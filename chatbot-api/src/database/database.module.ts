// import { Global, Module } from '@nestjs/common';
// // import { DatabaseProviders } from './database.providers';
// import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

// const typeOrmOptions: TypeOrmModuleOptions = {
//   ...DatabaseProviders[0].useFactory(),
//   autoLoadEntities: true,
// };

// @Global()
// @Module({
//   imports: [TypeOrmModule.forRoot(typeOrmOptions)],
//   exports: [TypeOrmModule],
// })
// export class DatabaseModule {}
