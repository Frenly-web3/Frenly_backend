import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

import { ScheduleModule } from '@nestjs/schedule';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';
import * as httpContext from 'express-http-context';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './infrastructure/middlewares/strategies/jwt.strategy';

import { ApiConfigModule } from './infrastructure/config/api-config.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

import { HttpExceptionFilter } from './infrastructure/middlewares/filters/http-exception.filter';
import { ApiResponseInterceptor } from './infrastructure/middlewares/interceptors/api-response.interceptor';

import { MapperProfile } from './infrastructure/mapper/profile.mapper';

import { BlockchainConfigStorage } from './services/utils/blockchain-config.storage';

import { BlockSubscriberService } from './services/block-subscriber.service';
import { CronService } from './services/cron.service';
import { ApiJWTService } from './services/jwt.service';
import { AuthenticationService } from './services/authentication.service';
import { CurrentUserService } from './services/current-user.service';
import { IPFSService } from './services/ipfs.service';
import { FeedService } from './services/feed.service';
import { AdminService } from './services/admin.service';
import { UserService } from './services/user.service';
import { ENSService } from './services/ens.service';

import { UserRepository } from './repository/user.repository';
import { ProcessedBlocksRepository } from './repository/processed-blocks.repository';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { PostRepository } from './repository/post.repository';
import { NftTokenPostRepository } from './repository/nft-token-post.repository';
import { SubscriptionRepository } from './repository/subscriptions.repository';
import { NftMetadataRepository } from './repository/nft-metadata.repository';

import { BlockSubscriberController } from './controller/block-subscriber.controller';
import { AuthenticationController } from './controller/authentication.controller';
import { FeedController } from './controller/feed.controller';
import { AdminController } from './controller/admin.controller';
import { UserController } from './controller/user.controller';
import { ENSController } from './controller/ens.controller';

@Module({
  imports: [
    ApiConfigModule,
    ScheduleModule.forRoot(),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: (configService: ApiConfigService) => configService.postgresConfig,
      inject: [ApiConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/api',
    }),
    JwtModule.registerAsync({
      imports: [ApiConfigModule],
      useFactory: (configService: ApiConfigService) => ({
        secret: configService.accessTokenSecret,
        signOptions: {
          expiresIn: `${configService.accessTokenExpirationTime}ms`,
        },
      }),
      inject: [ApiConfigService],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [
    BlockSubscriberController,
    AuthenticationController,
    FeedController,
    AdminController,
    UserController,
    ENSController,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useValue: new HttpExceptionFilter(),
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new ApiResponseInterceptor(),
    },

    BlockSubscriberService,
    CronService,
    ApiJWTService,
    AuthenticationService,
    CurrentUserService,
    IPFSService,
    FeedService,
    AdminService,
    UserService,
    ENSService,

    JwtStrategy,

    MapperProfile,

    BlockchainConfigStorage,

    UserRepository,
    ProcessedBlocksRepository,
    RefreshTokenRepository,
    PostRepository,
    NftTokenPostRepository,
    NftMetadataRepository,
    SubscriptionRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(httpContext.middleware).forRoutes('*');
  }
}
