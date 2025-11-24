import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  schema: process.env.DB_SCHEMA || 'public',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
};

export default new DataSource(options);
