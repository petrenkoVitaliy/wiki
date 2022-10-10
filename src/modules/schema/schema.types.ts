import { Header, Schema, Body, ArticleVersion } from '@prisma/client';

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

export type ArticleVersionShortAggregation = ArticleVersion & {
  schema: Schema;
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

export type ApprovedArticleVersionResponse = {
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
