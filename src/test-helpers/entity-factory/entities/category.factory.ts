import { Injectable } from '@nestjs/common';
import { Article, Category } from '@prisma/client';

@Injectable()
export class CategoryFactory {
  private entitySeq = 0;

  basic(options: { parentId?: number | null }): Category {
    const id = ++this.entitySeq;

    return {
      id,
      name: `category_${id}`,
      description: `description_${id}`,
      enabled: true,
      archived: false,

      parentId: options.parentId || null,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: { parentId?: number | null; articles: Article[] }): Category & {
    articleCategories: {
      articleCode: string;
      categoryId: number;
      article: Article;
    }[];
  } {
    const basicEntity = this.basic(options);

    const articleCategories = options.articles.map((article) => {
      return {
        articleCode: article.code,
        categoryId: basicEntity.id,
        article,
      };
    });

    return {
      ...basicEntity,
      articleCategories,
    };
  }
}
