import { Injectable } from '@nestjs/common';
import {
  Article,
  ArticleLanguage,
  ArticleVersion,
  Language,
} from '@prisma/client';

@Injectable()
export class ArticleLanguageFactory {
  private entitySeq = 0;

  basic(options: {
    languageId?: number;
    articleCode?: string;
  }): ArticleLanguage {
    const id = ++this.entitySeq;

    return {
      code: `article_language_code_${id}`,
      name: `article language ${id}`,
      nameCode: `article_language_${id}`,

      enabled: true,

      languageId: options.languageId || 0,
      articleCode: options.articleCode || '',

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    language?: Language;
    article?: Article;
    languageId?: number;
    articleCode?: string;
    articleVersion: ArticleVersion[];
  }): ArticleLanguage & {
    language?: Language;
    article?: Article;
    articleVersion: ArticleVersion[];
  } {
    const basicEntity = this.basic({
      articleCode: options?.article?.code || options.articleCode,
      languageId: options.language?.id || options.languageId,
    });

    return {
      ...basicEntity,

      language: options.language,
      article: options.article,
      articleVersion: options.articleVersion,
    };
  }
}
