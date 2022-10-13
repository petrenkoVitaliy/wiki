import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/modules/app/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

export const initTestModule = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const prismaService = app.get(PrismaService);

  prismaService.enableShutdownHooks(app);
  await app.init();

  return {
    app,
    prismaService,
  };
};

export const closeConnection = async (app: INestApplication, prismaService: PrismaService) => {
  await prismaService.$disconnect();
  await app.close();
};
