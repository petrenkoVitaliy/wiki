import {
  Article,
  ArticleLanguage,
  ArticleType,
  ArticleVersion,
  Language,
  Schema,
  Section,
} from '@prisma/client';

export type ArticleWithVersionsAggregation = Article & {
  articleLanguages: (ArticleLanguage & {
    language: Language;
    articleVersions: ArticleVersion[];
  })[];
};

type SchemaAggregation = Schema & { sections: Section[] };

export type ArticleLanguageWithDraftsAggregation = ArticleLanguage & {
  article: Article;
  articleVersions: (ArticleVersion & {
    schema: SchemaAggregation & {
      childSchemas: SchemaAggregation[];
    };
  })[];
};

export type ArticlesAggregation = Article & {
  articleLanguages: (ArticleLanguage & {
    language: Language;
  })[];
};

export type ArticleAggregation =
  | Article & {
      articleLanguages: (ArticleLanguage & {
        language: Language;
        articleVersions: (ArticleVersion & {
          schema: Schema & { sections: Section[] };
        })[];
      })[];
    };

export type LanguageAggregation = ArticleLanguage & {
  language: Language;
};

export type MappedSchema = {
  code: string;
  section: {
    content: string;
  }[];
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
