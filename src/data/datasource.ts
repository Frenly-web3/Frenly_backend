import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { ProcessedBlocksEntity } from './entity/processed-blocks.entity';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { SubscriptionEntity } from './entity/subscription.entity';
import { TokenTransfersContentEntity } from './entity/token-transfers-content.entity';
import { UserContentEntity } from './entity/user-content.entity';
import { UserEntity } from './entity/user.entity';

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
    ProcessedBlocksEntity,
    RefreshTokenEntity,
    SubscriptionEntity,
    TokenTransfersContentEntity,
    UserContentEntity,
    UserEntity,
  ],
  migrations: ['src/data/migrations/*.*'],
  synchronize: false,
});
