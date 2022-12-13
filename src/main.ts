import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import fs from 'fs';

import { BlockchainTypeEnum } from './infrastructure/config/enums/blockchain-type.enum';
import { BlockchainConfigStorage } from './services/utils/blockchain-config.storage';

import { AppModule } from './app.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';
import { BlockSubscriberService } from './services/block-subscriber.service';

async function bootstrap() {
  await use(Web3ClientPlugin);

  const app = await NestFactory.create(AppModule);

  const config: ApiConfigService = app.get(ApiConfigService);
  const { port } = config;

  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }

  if (!fs.existsSync('./public/token-images')) {
    fs.mkdirSync('./public/token-images');
  }

  if (!fs.existsSync('./public/community-content/images')) {
    fs.mkdirSync('./public/community-content/images');
  }

  try {
    const typeORMconnection = app.get(DataSource);
    await typeORMconnection.runMigrations();
  } catch (e) {
    process.exit(e);
  }

  const blockchainStorage = app.get(BlockchainConfigStorage);

  blockchainStorage.addConfig(BlockchainTypeEnum.ETHEREUM);
  blockchainStorage.addConfig(BlockchainTypeEnum.POLYGON_MAINNET);

  const blockSubscriber = app.get(BlockSubscriberService);
  await blockSubscriber.subscribe();

  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(port);
}
bootstrap();
