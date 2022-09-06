import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

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
  ],
  migrations: ['src/data/migrations/*.*'],
  synchronize: false,
});
