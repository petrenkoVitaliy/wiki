import { ArticleVersion, Schema, SchemasOnSections, Section } from '@prisma/client';

export type ArticleVersionAggregation = ArticleVersion & {
  schema: Schema & {
    sections: (SchemasOnSections & {
      section: Section;
    })[];
  };
};

export type ArticleVersionResponse = {
  code: string;
  version: number;

  schema: {
    code: string;
    sections: { content: string; name: string }[];
  };
};
