import { cleanupOpenApiDoc } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@modules/app/app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/v1/api');
  app.enableCors();

  const openApiDoc = SwaggerModule
    .createDocument(app, new DocumentBuilder()
      .setTitle("Example API")
      .setDescription("Example API description")
      .setVersion("1.0")
      .build());
  SwaggerModule.setup('/v1/api/docs', app, cleanupOpenApiDoc(openApiDoc));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Core API is running on http://localhost:${port}/v1/api`);
}

void bootstrap();
