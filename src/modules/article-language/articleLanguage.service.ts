import { Injectable } from '@nestjs/common';
import { ArticleLanguage } from '@prisma/client';

import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';
import { PatchArticleLanguageDto } from './articleLanguage.dtos';
import { ArticleLanguageResponse } from './articleLanguage.types';

@Injectable()
export class ArticleLanguageService {
  constructor(private articleLanguageRepository: ArticleLanguageRepository) {}

  async patchArticleLanguage(payload: PatchArticleLanguageDto, options: { code: string }) {
    const articleLanguage = await this.articleLanguageRepository.update(payload, options);

    return this.mapToArticleLanguageResponse(articleLanguage);
  }

  async deleteArticleLanguage(options: { code: string }) {
    const articleLanguage = await this.articleLanguageRepository.update(
      {
        archived: true,
      },
      options,
    );

    return this.mapToArticleLanguageResponse(articleLanguage);
  }

  mapToArticleLanguageResponse(articleLanguage: ArticleLanguage): ArticleLanguageResponse {
    return {
      code: articleLanguage.code,
      name: articleLanguage.name,
    };
  }
}
