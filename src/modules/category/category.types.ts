import {
  Article,
  ArticleCategory,
  ArticleLanguage,
  ArticleType,
  Category,
  Language,
} from '@prisma/client';

export type CategoryAggregation = Category & {
  articleCategories: (ArticleCategory & {
    article: Article & {
      articleLanguages: (ArticleLanguage & {
        language: Language;
      })[];
    };
  })[];
};

export type CategoriesTree = {
  id: number;
  name: string;
  description: string;
  parentId: number | null;

  articles: {
    type: ArticleType;
    name: string;
    code: string;
  }[];

  children: CategoriesTree[];
};
