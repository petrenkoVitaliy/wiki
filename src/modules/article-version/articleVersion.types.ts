import { ArticleVersion, Schema, Section } from '@prisma/client';

export type ArticleVersionAggregation = ArticleVersion & {
  schema: Schema & {
    sections: Section[];
  };
};

export type ArticleVersionResponse = {
  code: string;
  version: number;

  schema: {
    code: string;
    sections: { content: string }[];
  };
};
