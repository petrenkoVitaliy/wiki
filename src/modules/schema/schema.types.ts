import { Schema, ArticleVersion, Section, SchemasOnSections } from '@prisma/client';

export type SchemasOnSectionsNested = SchemasOnSections & {
  section: Section;
};

export type SchemaWithSectionsAggregation = Schema & {
  sections: SchemasOnSectionsNested[];
  parentSchema:
    | (Schema & {
        sections: SchemasOnSectionsNested[];
      })
    | null;
  articleVersion: ArticleVersion | null;
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
    order: number;
  }[];
  toUpdate: {
    code: string;
    order: number;
  }[];
  toCreate: {
    content: string;
    name: string;
    order: number;
  }[];
};

type SchemaContentResponse = {
  sections: { content: string; name: string }[];
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
    sections: { content: string; name: string }[];
  };
};
