import { Injectable } from '@nestjs/common';
import { Article, ArticleLanguage, ArticleVersion, Language } from '@prisma/client';

@Injectable()
export class ArticleLanguageFactory {
  private entitySeq = 0;

  basic(options: {
    languageId?: number;
    articleCode?: string;
    enabled?: boolean;
    archived?: boolean;
  }): ArticleLanguage {
    const id = ++this.entitySeq;

    return {
      code: `article_language_code_${id}`,
      name: `article language ${id}`,
      nameCode: `article_language_${id}`,

      enabled: options.enabled !== undefined ? options.enabled : true,
      archived: options.archived !== undefined ? options.archived : false,

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
    enabled?: boolean;
    archived?: boolean;
    articleVersions: ArticleVersion[];
  }): ArticleLanguage & {
    language?: Language;
    article?: Article;
    articleVersions: ArticleVersion[];
  } {
    const basicEntity = this.basic({
      articleCode: options?.article?.code || options.articleCode,
      languageId: options.language?.id || options.languageId,
      enabled: options.enabled,
      archived: options.archived,
    });

    return {
      ...basicEntity,

      language: options.language,
      article: options.article,
      articleVersions: options.articleVersions,
    };
  }
}
