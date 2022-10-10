import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot(options: { global: boolean }) {
    return {
      global: options.global,
      module: PrismaModule,
    };
  }
}
