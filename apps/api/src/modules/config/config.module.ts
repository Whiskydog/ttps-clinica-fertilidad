import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import typeormConfig from './typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync(typeormConfig.asProvider()),
  ],
})
export class ConfigModule {}
