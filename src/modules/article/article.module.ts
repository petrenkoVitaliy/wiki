import { Module } from '@nestjs/common';

import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';

import { ArticleRepository } from '../../repositories/article.repository';
import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';
import { LanguageRepository } from '../../repositories/language.repository';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ArticleLanguageRepository, LanguageRepository],
})
export class ArticleModule {}
