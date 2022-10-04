import { Module } from '@nestjs/common';

import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaService } from '../../services/prisma.service';

import { ArticleRepository } from '../../repositories/article.repository';
import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';
import { LanguageRepository } from '../../repositories/language.repository';

@Module({
  controllers: [ArticleController],
  providers: [
    ArticleService,
    PrismaService,
    ArticleRepository,
    ArticleLanguageRepository,
    LanguageRepository,
  ],
})
export class ArticleModule {}
