import { EntityFactoryModule } from '../../../test-helpers/entity-factory/entityFactory';
import { SchemaAggregation } from '../schema.types';

export const getSchemaAggregation = (entityFactory: EntityFactoryModule) => {
  const parentSchema = entityFactory.schema.extended({});
  const articleVersion = entityFactory.articleVersion.basic({});

  const schema = entityFactory.schema.extended({
    parentSchema,
    articleVersion,
  }) as SchemaAggregation;

  return { schema };
};

export const getSchemaAggregationWithoutVersion = (entityFactory: EntityFactoryModule) => {
  const parentSchema = entityFactory.schema.extended({});

  const schema = entityFactory.schema.extended({
    parentSchema,
  }) as SchemaAggregation;

  return { schema };
};

export const getArticleVersionWithSiblings = (entityFactory: EntityFactoryModule) => {
  const schema = entityFactory.schema.extended({});

  const articleVersion = entityFactory.articleVersion.extended({
    schema,
    actual: true,
  });

  return { articleVersion };
};

export const getSingleArticleVersionWithSiblings = (entityFactory: EntityFactoryModule) => {
  const schema = entityFactory.schema.extended({});
  const baseArticleVersion = entityFactory.articleVersion.extended({ schema });

  const articleLanguage = entityFactory.articleLanguage.extended({
    articleVersion: [baseArticleVersion],
  });

  const articleVersion = {
    ...baseArticleVersion,
    articleLanguage: articleLanguage,
  };

  return { articleVersion };
};

export const getSchemaFixture = (schema: Partial<SchemaAggregation> | null) => ({
  header: {
    content: schema?.header?.content,
  },
  body: {
    content: schema?.body?.content,
  },
});
