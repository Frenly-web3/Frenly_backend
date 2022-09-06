import { NestFactory } from '@nestjs/core';
import { Connection } from 'typeorm';
import { AppModule } from './app.module';

import { ApiConfigService } from './infrastructure/config/api-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config: ApiConfigService = app.get(ApiConfigService);
  const { port } = config;

  try {
    const typeORMconnection = app.get(Connection);
    await typeORMconnection.runMigrations();
  } catch (e) {
    process.exit(e);
  }

  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(port);
}
bootstrap();
