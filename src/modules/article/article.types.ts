import { Article, ArticleLanguage, ArticleType, ArticleVersion, Language } from '@prisma/client';

import { SchemaNested } from '../schema/schema.types';

type ArticleLanguagesAggregation<T = unknown> = {
  articleLanguages: (ArticleLanguage & {
    language: Language;
  } & T)[];
};

export type ArticleLanguageWithDraftsAggregation = ArticleLanguage & {
  article: Article;
  articleVersions: (ArticleVersion & {
    schema: SchemaNested & {
      childSchemas: SchemaNested[];
    };
  })[];
};

export type ArticleAggregation = Article & ArticleLanguagesAggregation;

export type ArticleWithVersionAggregation = Article &
  ArticleLanguagesAggregation<{ articleVersions: ArticleVersion[] }>;

export type ArticleWithSchemaAggregation = Article &
  ArticleLanguagesAggregation<{
    articleVersions: (ArticleVersion & {
      schema: SchemaNested;
    })[];
  }>;

export type LanguageAggregation = ArticleLanguage & {
  language: Language;
};

export type MappedSchema = {
  code: string;
  sections: {
    name: string;
    content: string;
  }[];
};

export type ArticleResponse = {
  code: string;
  type: ArticleType;
  languages?: string[];

  articleLanguage: {
    code: string;
    name: string;

    version: {
      code: string;
      version: number;

      schema: MappedSchema;
    };
  };
};

export type ArticleShortResponse = {
  code: string;
  type: ArticleType;

  articleLanguage: {
    name: string;
  };
};

export type ArticleDraftsResponse = {
  code: string;

  articleLanguage: {
    name: string;
    code: string;
  };

  articleVersions: {
    version: number;
    code: string;

    schema: MappedSchema;
    drafts: MappedSchema[];
  }[];
};

export type ArticleWithVersionResponse = {
  code: string;
  version: number;
};
