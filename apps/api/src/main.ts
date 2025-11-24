import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@modules/app/app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('/v1/api');
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGIN') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Servir archivos estáticos desde la carpeta uploads
  // __dirname apunta a dist/ después de compilar, así que subimos dos niveles y bajamos a uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  logger.log(`Configurando archivos estáticos en: ${uploadsPath}`);

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Example API')
      .setDescription('Example API description')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('/v1/api/docs', app, cleanupOpenApiDoc(openApiDoc));

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  logger.log(`Core API is running on http://localhost:${port}/v1/api`);
}

void bootstrap();
