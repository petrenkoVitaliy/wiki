import { Language } from '@prisma/client';

import { EntityFactoryModule } from '../../../test-helpers/entity-factory/entityFactory';
import {
  ArticleWithSchemaAggregation,
  ArticleLanguageWithDraftsAggregation,
  LanguageAggregation,
} from '../article.types';

export const getArticleAggregation = (
  params: {
    entityFactory: EntityFactoryModule;
    languages: Language[];
  },
  options?: {
    enabled?: boolean;
    archived?: boolean;
  },
) => {
  const { entityFactory, languages } = params;

  const section = entityFactory.section.extended({ order: 1 });
  const schema = entityFactory.schema.extended({ sections: [section] });
  const articleVersion = entityFactory.articleVersion.extended({
    schema,
    actual: true,
  });

  const articleLanguages = languages.map((language) =>
    entityFactory.articleLanguage.extended({
      language,
      articleVersions: [articleVersion],
    }),
  ) as LanguageAggregation[];

  const article = entityFactory.article.extended({
    ...options,
    articleLanguages: articleLanguages,
  }) as ArticleWithSchemaAggregation;

  return {
    schema,
    article,
    articleLanguages,
    articleVersion,
  };
};

export const getArticleLanguageWithDraftsAggregation = (
  entityFactory: EntityFactoryModule,
  options?: {
    articleLanguage?: {
      enabled?: boolean;
      archived?: boolean;
    };
    article?: {
      enabled?: boolean;
      archived?: boolean;
    };
  },
) => {
  const section1_1 = entityFactory.section.extended({ order: 1 });
  const section1_2 = entityFactory.section.extended({ order: 2 });
  const schema1 = entityFactory.schema.extended({ sections: [section1_1, section1_2] });

  const section2_1 = entityFactory.section.extended({ order: 1 });
  const section2_2 = entityFactory.section.extended({ order: 2 });
  const schema2 = entityFactory.schema.extended({ sections: [section2_1, section2_2] });

  const section3_1 = entityFactory.section.extended({ order: 1 });
  const section3_2 = entityFactory.section.extended({ order: 2 });
  const section3_3 = entityFactory.section.extended({ order: 3 });
  const schema3 = entityFactory.schema.extended({
    childSchemas: [schema1, schema2],
    sections: [section3_1, section3_2, section3_3],
  });

  const articleVersion1 = entityFactory.articleVersion.extended({
    schema: schema3,
    version: 1,
  });

  const articleVersion2 = entityFactory.articleVersion.extended({
    schema: schema3,
    version: 2,
  });

  const article = entityFactory.article.basic({ ...options?.article });

  const articleLanguage = entityFactory.articleLanguage.extended({
    ...options?.articleLanguage,
    article,
    articleVersions: [articleVersion1, articleVersion2],
  }) as ArticleLanguageWithDraftsAggregation;

  return {
    schema1,
    schema2,
    schema3,
    articleVersion1,
    articleVersion2,
    article,
    articleLanguage,
  };
};
