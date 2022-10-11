import { Injectable } from '@nestjs/common';
import { Article, ArticleLanguage, ArticleType } from '@prisma/client';

@Injectable()
export class ArticleFactory {
  private entitySeq = 0;

  basic(options?: { enabled?: boolean; archived?: boolean }): Article {
    const id = ++this.entitySeq;

    return {
      code: `article_code_${id}`,

      enabled: options?.enabled !== undefined ? options.enabled : true,
      archived: options?.archived !== undefined ? options.archived : false,
      type: ArticleType.common,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    articleLanguages: ArticleLanguage[];
    enabled?: boolean;
    archived?: boolean;
  }): Article & {
    articleLanguages: ArticleLanguage[];
  } {
    const basicEntity = this.basic(options);

    return {
      ...basicEntity,
      articleLanguages: options.articleLanguages,
    };
  }
}
