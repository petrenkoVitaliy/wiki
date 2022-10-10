import {
  Article,
  ArticleLanguage,
  ArticleType,
  ArticleVersion,
  Body,
  Header,
  Language,
  Schema,
} from '@prisma/client';

export type ArticleWithVersionsAggregation = Article & {
  articleLanguage: (ArticleLanguage & {
    language: Language;
    articleVersion: ArticleVersion[];
  })[];
};

type SchemaAggregation = Schema & { body: Body | null; header: Header | null };

export type ArticleLanguageWithDraftsAggregation = ArticleLanguage & {
  article: Article;
  articleVersion: (ArticleVersion & {
    schema: SchemaAggregation & {
      childSchema: SchemaAggregation[];
    };
  })[];
};

export type ArticlesAggregation = Article & {
  articleLanguage: (ArticleLanguage & {
    language: Language;
  })[];
};

export type ArticleAggregation =
  | Article & {
      articleLanguage: (ArticleLanguage & {
        language: Language;
        articleVersion: (ArticleVersion & {
          schema: Schema & { body: Body | null; header: Header | null };
        })[];
      })[];
    };

export type LanguageAggregation = ArticleLanguage & {
  language: Language;
};

export type MappedSchema = {
  code: string;
  body?: {
    content: string;
  };
  header?: {
    content: string;
  };
};

export type ArticleResponse = {
  languages: string[] | undefined;
  articleLanguage: {
    version: {
      schema: MappedSchema;
      code: string;
      version: number;
    };
    code: string;
    name: string;
  };
  code: string;
  type: ArticleType;
};

export type ArticleShortResponse = {
  articleLanguage: {
    name: string;
  };
  code: string;
  type: ArticleType;
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

export type ArticleVersionShortResponse = {
  code: string;
  version: number;
};
