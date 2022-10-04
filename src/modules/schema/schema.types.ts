import {
  Header,
  Schema,
  Body,
  ArticleVersion,
  ArticleLanguage,
} from '@prisma/client';

export type SchemaAggregation = Schema & {
  parentSchema:
    | (Schema & {
        body: Body | null;
        header: Header | null;
      })
    | null;
  body: Body | null;
  header: Header | null;
  articleVersion: ArticleVersion | null;
};

export type ArticleVersionAggregation = ArticleVersion & {
  schema: Schema;
};

export type ArticleVersionAggregationExtended = ArticleVersion & {
  schema: Schema & {
    body: Body | null;
    header: Header | null;
  };
};

type SchemaContentResponse = {
  body?: {
    content: string;
  };
  header?: {
    content: string;
  };
};

export type SchemaResponse = {
  shouldBeRenovated: boolean;
  code: string;
  parentSchema: SchemaContentResponse;
} & SchemaContentResponse;

export type NewArticleVersionResponse = {
  code: string;
  version: number;
  schema: {
    code: string;
    body?: {
      content: string;
    };
    header?: {
      content: string;
    };
  };
};

export type ArticleVersionWithSiblings = ArticleVersion & {
  articleLanguage: ArticleLanguage & {
    articleVersion: (ArticleVersion & {
      schema: Schema;
    })[];
  };
};

export type BasicArticleVersion = ArticleVersion & {
  schema: Schema;
};
