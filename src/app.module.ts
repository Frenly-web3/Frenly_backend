import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { ScheduleModule } from '@nestjs/schedule';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiConfigModule } from './infrastructure/config/api-config.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

import { HttpExceptionFilter } from './infrastructure/middlewares/filters/http-exception.filter';
import { ApiResponseInterceptor } from './infrastructure/middlewares/interceptors/api-response.interceptor';

import { BlockSubscriberService } from './services/block-subscriber.service';
import { CronService } from './services/cron.service';

import { TokenTransfersContentRepository } from './repository/token-transfer-content.repository';
import { UserContentRepository } from './repository/user-content.repository';
import { UserRepository } from './repository/user.repository';
import { ProcessedBlocksRepository } from './repository/processed-blocks.repository';

import { BlockSubscriberController } from './controller/block-subscriber.controller';

@Module({
  imports: [
    ApiConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: (configService: ApiConfigService) => configService.postgresConfig,
      inject: [ApiConfigService],
    }),
  ],
  controllers: [
    BlockSubscriberController,
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

    TokenTransfersContentRepository,
    UserContentRepository,
    UserRepository,
    ProcessedBlocksRepository,
  ],
})
export class AppModule {}
