import * as dotenv from 'dotenv';
// import { DataSource } from 'typeorm';

import { TSMigrationGenerator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Options } from '@mikro-orm/postgresql';
import { NftMetadataEntity } from './entity/nft-metadata.entity';
import { NftTokenPostEntity } from './entity/nft-token-post.entity';
import { PostEntity } from './entity/post.entity';
import { ProcessedBlocksEntity } from './entity/processed-blocks.entity';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { SubscriptionEntity } from './entity/subscription.entity';
import { UserEntity } from './entity/user.entity';
import { CommunityEntity } from './entity/community.entity';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

// export const AppDataSource = new DataSource({
//   name: 'default',
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: +process.env.DB_PORT,
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   entities: [
//     NftMetadataEntity,
//     NftTokenPostEntity,
//     PostEntity,
//     RefreshTokenEntity,
//     UserEntity,
//     ProcessedBlocksEntity,
//     SubscriptionEntity,
//     CommunityEntity,
//   ],
//   migrations: ['src/data/migrations/*.*'],
//   synchronize: false,
// });

const dbConfig: Options = {
  metadataProvider: TsMorphMetadataProvider,
  allowGlobalContext: true,
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: String(process.env.DB_PASSWORD),
  dbName: process.env.DB_NAME,
  entities: [
    NftMetadataEntity,
    NftTokenPostEntity,
    PostEntity,
    RefreshTokenEntity,
    UserEntity,
    ProcessedBlocksEntity,
    SubscriptionEntity,
    CommunityEntity,
  ],
  // seeder: {
  //   path: './DAL/seeders', // path to the folder with seeders
  //   pathTs: './src/DAL/seeders', // path to the folder with TS seeders (if used, we should put path to compiled files in `path`)
  //   defaultSeeder: 'DatabaseSeeder', // default seeder class name
  //   glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
  //   emit: 'ts', // seeder generation mode
  //   fileName: (className: string) => className, // seeder file naming convention
  // },
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: './src/DAL/migrations', // path to the folder with migrations
    pathTs: './src/DAL/migrations', // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot when creating new migrations
    emit: 'ts', // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
};

export default dbConfig;
