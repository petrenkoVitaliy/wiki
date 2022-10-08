import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  logger = new Logger();
  transaction = this.$transaction;

  async onModuleInit() {
    this.logger.verbose('Prisma connected');

    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      this.logger.verbose('Prisma disconnected');

      await app.close();
    });
  }
}
