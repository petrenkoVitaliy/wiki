import { Injectable } from '@nestjs/common';
import { Article, ArticleLanguage, ArticleType } from '@prisma/client';

@Injectable()
export class ArticleFactory {
  private entitySeq = 0;

  basic(): Article {
    const id = ++this.entitySeq;

    return {
      code: `article_code_${id}`,

      enabled: true,
      archived: false,
      type: ArticleType.common,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: { articleLanguage: ArticleLanguage[] }): Article & {
    articleLanguage: ArticleLanguage[];
  } {
    const id = ++this.entitySeq;

    return {
      code: `article_code_${id}`,

      enabled: true,
      archived: false,
      type: ArticleType.common,

      articleLanguage: options.articleLanguage,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }
}
