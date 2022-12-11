// import { TSMigrationGenerator } from '@mikro-orm/migrations';
import { Options } from '@mikro-orm/postgresql';
// import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dbConfig from 'src/data/datasource';
// import { CommunityEntity } from '../../data/entity/community.entity';
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// import { NftMetadataEntity } from '../../data/entity/nft-metadata.entity';
// import { NftTokenPostEntity } from '../../data/entity/nft-token-post.entity';
// import { PostEntity } from '../../data/entity/post.entity';
// import { ProcessedBlocksEntity } from '../../data/entity/processed-blocks.entity';
// import { RefreshTokenEntity } from '../../data/entity/refresh-token.entity';
// import { SubscriptionEntity } from '../../data/entity/subscription.entity';
// import { UserEntity } from '../../data/entity/user.entity';
// import dbConfig from 'src/data/datasource';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  // App Core Preferences

  get port(): number {
    return this.configService.get<number>('APP_PORT');
  }

  // Database preferences

  // // Postgres connection preferences

  get postgresConfig(): Options {
    // const options: Options = {
    //   metadataProvider: TsMorphMetadataProvider,
    //   allowGlobalContext: true,
    //   type: 'postgresql',
    //   host: process.env.DB_HOST,
    //   port: Number(process.env.DB_PORT),
    //   user: process.env.DB_USERNAME,
    //   password: String(process.env.DB_PASSWORD),
    //   dbName: process.env.DB_NAME,
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
    //   // seeder: {
    //   //   path: './DAL/seeders', // path to the folder with seeders
    //   //   pathTs: './src/DAL/seeders', // path to the folder with TS seeders (if used, we should put path to compiled files in `path`)
    //   //   defaultSeeder: 'DatabaseSeeder', // default seeder class name
    //   //   glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
    //   //   emit: 'ts', // seeder generation mode
    //   //   fileName: (className: string) => className, // seeder file naming convention
    //   // },
    //   migrations: {
    //     tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    //     path: './src/DAL/migrations', // path to the folder with migrations
    //     pathTs: './src/DAL/migrations', // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    //     glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    //     transactional: true, // wrap each migration in a transaction
    //     disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    //     allOrNothing: true, // wrap all migrations in master transaction
    //     dropTables: true, // allow to disable table dropping
    //     safe: false, // allow to disable table and column dropping
    //     snapshot: true, // save snapshot when creating new migrations
    //     emit: 'ts', // migration generation mode
    //     generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
    //   },
    // };

    // return options;
    // return {
    //   type: 'postgres',
    //   host: this.configService.get<string>('DB_HOST'),
    //   port: this.configService.get<number>('DB_PORT'),
    //   username: this.configService.get<string>('DB_USERNAME'),
    //   password: this.configService.get<string>('DB_PASSWORD'),
    //   database: this.configService.get<string>('DB_NAME'),
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
    //   keepConnectionAlive: true,
    //   synchronize: false,
    //   migrationsRun: true,
    //   migrations: ['src/data/migrations/*.*'],
    // };

    return dbConfig;
  }

  // JWT Preferences

  get accessTokenSecret(): string {
    return this.configService.get<string>('ACCESS_TOKEN_SECRET');
  }

  // // In MS
  get accessTokenExpirationTime(): number {
    return Number(this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME'));
  }

  // // In MS
  get refreshTokenExpirationTime(): number {
    return Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_TIME'));
  }

  // IPFS Preferences

  get nftStorageApiKey(): string {
    return this.configService.get<string>('NFT_STORAGE_API_KEY');
  }

  // Web3 Preferences

  get ethWebSocketProvider(): string {
    return this.configService.get<string>('ETH_WEB_SOCKET_PROVIDER');
  }

  get polygonWebSocketProvider(): string {
    return this.configService.get<string>('POLYGON_WEB_SOCKET_PROVIDER');
  }

  get ethHttpProvider(): string {
    return this.configService.get<string>('ETH_HTTP_PROVIDER');
  }

  get polygonHttpProvider(): string {
    return this.configService.get<string>('POLYGON_HTTP_PROVIDER');
  }

  get polygonMumbaiProvider(): string {
    return this.configService.get<string>('POLYGON_MUMBAI_PROVIDER');
  }

  get lensContractAddress(): string {
    return this.configService.get<string>('LENS_CONTRACT_ADDRESS');
  }
}
