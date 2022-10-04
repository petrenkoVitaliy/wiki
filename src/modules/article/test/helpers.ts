import { Language } from '@prisma/client';

import { EntityFactoryModule } from '../../../test-helpers/entity-factory/entityFactory';
import {
  ArticleAggregation,
  ArticleLanguageWithDraftsAggregation,
  LanguageAggregation,
} from '../article.types';

export const getArticleAggregation = (
  entityFactory: EntityFactoryModule,
  language: Language,
) => {
  const schema = entityFactory.schema.extended({});
  const articleVersion = entityFactory.articleVersion.extended({ schema });
  const articleLanguage = entityFactory.articleLanguage.extended({
    language,
    articleVersion: [articleVersion],
  }) as LanguageAggregation;

  const article = entityFactory.article.extended({
    articleLanguage: [articleLanguage],
  }) as ArticleAggregation;

  return {
    schema,
    article,
    articleLanguage,
    articleVersion,
  };
};

export const getArticleLanguageWithDraftsAggregation = (
  entityFactory: EntityFactoryModule,
) => {
  const schema1 = entityFactory.schema.extended({});
  const schema2 = entityFactory.schema.extended({});
  const schema3 = entityFactory.schema.extended({
    childSchema: [schema1, schema2],
  });

  const articleVersion1 = entityFactory.articleVersion.extended({
    schema: schema3,
    version: 1,
  });

  const articleVersion2 = entityFactory.articleVersion.extended({
    schema: schema3,
    version: 2,
  });

  const article = entityFactory.article.basic();

  const articleLanguage = entityFactory.articleLanguage.extended({
    article,
    articleVersion: [articleVersion1, articleVersion2],
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
