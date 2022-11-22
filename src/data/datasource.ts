import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { NftMetadataEntity } from './entity/nft-metadata.entity';
import { NftTokenPostEntity } from './entity/nft-token-post.entity';
import { PostEntity } from './entity/post.entity';
import { ProcessedBlocksEntity } from './entity/processed-blocks.entity';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { SubscriptionEntity } from './entity/subscription.entity';
import { UserEntity } from './entity/user.entity';
import { ZeroExEntity } from './entity/zeroex.entity';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

export const AppDataSource = new DataSource({
  name: 'default',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    NftMetadataEntity,
    NftTokenPostEntity,
    PostEntity,
    RefreshTokenEntity,
    UserEntity,
    ProcessedBlocksEntity,
    SubscriptionEntity,
    ZeroExEntity,
  ],
  migrations: ['src/data/migrations/*.*'],
  synchronize: false,
});
