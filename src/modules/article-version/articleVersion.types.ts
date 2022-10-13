import { ArticleVersion } from '@prisma/client';
import { SchemaNested } from '../schema/schema.types';

export type ArticleVersionAggregation = ArticleVersion & {
  schema: SchemaNested;
};

export type ArticleVersionResponse = {
  code: string;
  version: number;

  schema: {
    code: string;
    sections: { content: string; name: string }[];
  };
};
