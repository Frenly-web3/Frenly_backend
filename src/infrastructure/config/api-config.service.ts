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

  get polygonMainnetWebSocketProvider(): string {
    return this.configService.get<string>('POLYGON_MAINNET_WEB_SOCKET_PROVIDER');
  }

  get polygonMainnetHttpInfuraProvider(): string {
    return this.configService.get<string>('POLYGON_INFURA_MAINNET_HTTP_PROVIDER');
  }

  get polygonTestnetHttpInfuraProvider(): string {
    return this.configService.get<string>('POLYGON_INFURA_TESTNET_HTTP_PROVIDER');
  }

  get lensContractAddress(): string {
    return this.configService.get<string>('LENS_CONTRACT_ADDRESS');
  }
}
