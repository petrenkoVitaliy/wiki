import { ArticleVersion, Header, Schema, Body } from '@prisma/client';

export type ArticleVersionAggregation = ArticleVersion & {
  schema: Schema & {
    body: Body | null;
    header: Header | null;
  };
};

export type MappedArticleVersion = {
  code: string;
  version: number;

  schema: {
    code: string;
    header?: {
      content: string;
    };
    body?: {
      content: string;
    };
  };
};
