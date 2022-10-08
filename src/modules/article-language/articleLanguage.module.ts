import { Module } from '@nestjs/common';

import { ArticleLanguageController } from './articleLanguage.controller';
import { ArticleLanguageService } from './articleLanguage.service';
import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';

@Module({
  controllers: [ArticleLanguageController],
  providers: [ArticleLanguageService, ArticleLanguageRepository],
})
export class ArticleLanguageModule {}
