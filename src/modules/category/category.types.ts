import {
  Article,
  ArticleCategory,
  ArticleLanguage,
  ArticleType,
  Category,
  Language,
} from '@prisma/client';

export type ArticleLanguageWithCategoryAggregation = ArticleLanguage & {
  article: Article & {
    articleCategories: (ArticleCategory & {
      category: Category;
    })[];
  };
};

export type CategoryAggregation = Category & {
  articleCategories: (ArticleCategory & {
    article: Article & {
      articleLanguage: (ArticleLanguage & {
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
