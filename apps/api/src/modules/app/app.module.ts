import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
import { Module } from '@nestjs/common';

import HttpExceptionFilter from "@filters/HttpExceptionFilter";
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { CatsModule } from "@modules/cats/cats.module";
import { ConfigModule } from "@modules/config/config.module";

@Module({
  imports: [
    ConfigModule,
    CatsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter }
  ],
})
export class AppModule { }
