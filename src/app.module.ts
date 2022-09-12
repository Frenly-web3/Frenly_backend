import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

import { ScheduleModule } from '@nestjs/schedule';

import { TypeOrmModule } from '@nestjs/typeorm';

import * as httpContext from 'express-http-context';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './infrastructure/middlewares/strategies/jwt.strategy';

import { ApiConfigModule } from './infrastructure/config/api-config.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

import { HttpExceptionFilter } from './infrastructure/middlewares/filters/http-exception.filter';
import { ApiResponseInterceptor } from './infrastructure/middlewares/interceptors/api-response.interceptor';

import { BlockSubscriberService } from './services/block-subscriber.service';
import { CronService } from './services/cron.service';
import { ApiJWTService } from './services/jwt.service';
import { AuthenticationService } from './services/authentication.service';
import { CurrentUserService } from './services/current-user.service';
import { ContentService } from './services/content.service';
import { StatsService } from './services/stats.service';
import { UserService } from './services/user.service';

import { TokenTransfersContentRepository } from './repository/token-transfer-content.repository';
import { UserContentRepository } from './repository/user-content.repository';
import { UserRepository } from './repository/user.repository';
import { ProcessedBlocksRepository } from './repository/processed-blocks.repository';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { SubscriptionsRepository } from './repository/subscriptions.repository';

import { BlockSubscriberController } from './controller/block-subscriber.controller';
import { AuthenticationController } from './controller/authentication.controller';
import { ContentController } from './controller/content.controller';
import { StatsController } from './controller/stats.controller';
import { UserController } from './controller/user.controller';

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
    ContentController,
    StatsController,
    UserController,
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
    ContentService,
    StatsService,
    UserService,

    JwtStrategy,

    TokenTransfersContentRepository,
    UserContentRepository,
    UserRepository,
    ProcessedBlocksRepository,
    RefreshTokenRepository,
    SubscriptionsRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(httpContext.middleware).forRoutes('*');
  }
}
