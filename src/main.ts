import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './modules/app/app.module';
import { PrismaService } from './prisma/prisma.service';

const logger = new Logger();
const PORT = 3000;

const createSwaggerDocument = (app: INestApplication) => {
  const config = new DocumentBuilder().setTitle('WK').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
};

(async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  await app.get(PrismaService).enableShutdownHooks(app);

  createSwaggerDocument(app);

  await app.listen(PORT);

  logger.verbose(`Port: ${PORT}`);
})();
