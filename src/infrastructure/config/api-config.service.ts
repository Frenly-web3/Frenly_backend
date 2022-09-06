import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ProcessedBlocksEntity } from '../../data/entity/processed-blocks.entity';
import { RefreshTokenEntity } from '../../data/entity/refresh-token.entity';
import { SubscriptionEntity } from '../../data/entity/subscription.entity';
import { TokenTransfersContentEntity } from '../../data/entity/token-transfers-content.entity';
import { UserContentEntity } from '../../data/entity/user-content.entity';
import { UserEntity } from '../../data/entity/user.entity';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  // App Core Preferences

  get port(): number {
    return this.configService.get<number>('APP_PORT');
  }

  // Database preferences

  // // Postgres connection preferences

  get postgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      entities: [
        ProcessedBlocksEntity,
        RefreshTokenEntity,
        SubscriptionEntity,
        TokenTransfersContentEntity,
        UserContentEntity,
        UserEntity,
      ],
      keepConnectionAlive: true,
      synchronize: false,
      migrationsRun: true,
      migrations: ['src/data/migrations/*.*'],
    };
  }
}
