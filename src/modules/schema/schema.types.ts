import { Schema, ArticleVersion, Section } from '@prisma/client';

export type SchemaAggregation = Schema & {
  parentSchema:
    | (Schema & {
        sections: Section[];
      })
    | null;
  articleVersion: ArticleVersion | null;
  sections: Section[];
};

export type ArticleVersionShortAggregation = ArticleVersion & {
  schema: Schema;
};

export type ContentUpdateGroups = {
  toDelete: {
    code: string;
  }[];
  toConnect: {
    code: string;
  }[];
  toCreate: {
    content: string;
  }[];
};

type SchemaContentResponse = {
  section: { content: string }[];
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
    section: { content: string }[];
  };
};
