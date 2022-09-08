import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiConfigModule } from './infrastructure/config/api-config.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

import { HttpExceptionFilter } from './infrastructure/middlewares/filters/http-exception.filter';
import { ApiResponseInterceptor } from './infrastructure/middlewares/interceptors/api-response.interceptor';

import { BlockSubscriberService } from './services/block-subscriber.service';

@Module({
  imports: [
    ApiConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: (configService: ApiConfigService) => configService.postgresConfig,
      inject: [ApiConfigService],
    }),
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
  ],
})
export class AppModule {}
