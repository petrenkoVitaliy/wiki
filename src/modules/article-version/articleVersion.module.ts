import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { ArticleVersionController } from './articleVersion.controller';
import { ArticleVersionService } from './articleVersion.service';

import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';

@Module({
  controllers: [ArticleVersionController],
  providers: [ArticleVersionService, PrismaService, ArticleVersionRepository],
})
export class ArticleVersionModule {}
