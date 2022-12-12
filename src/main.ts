import { NestFactory } from '@nestjs/core';

import { use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import fs from 'fs';

import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { BlockchainTypeEnum } from './infrastructure/config/enums/blockchain-type.enum';
import { BlockchainConfigStorage } from './services/utils/blockchain-config.storage';

import { AppModule } from './app.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';
import { BlockSubscriberService } from './services/block-subscriber.service';
import dbConfig from './data/datasource';

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

  try {
    const orm = await MikroORM.init<PostgreSqlDriver>(dbConfig);
    const migrator = orm.getMigrator();

    // await migrator.createMigration();
    await migrator.up()

    // if we don't need to delete database
    // const generator = orm.getSchemaGenerator();

    // if we need to delete the database
    // await generator.refreshDatabase();

    // await generator.updateSchema(); // make migration

    // const seeder = orm.getSeeder();
    // eslint-disable-next-line max-len
    // await seeder.seed(DatabaseSeeder); // add to DB default admin, unlimited and standart(user can take 5 books at one time) abonements and 3 defaults authors
    // app.use((req, res, next) => {
    //   RequestContext.createAsync(orm.em, next);
    // });
    await orm.close();
    // const typeORMconnection = app.get(DataSource);
    // await typeORMconnection.runMigrations();
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
