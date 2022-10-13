import { EntityFactoryModule } from '../../../test-helpers/entity-factory/entityFactory';
import { SchemaWithSectionsAggregation } from '../schema.types';

export const getSchemaAggregation = (entityFactory: EntityFactoryModule) => {
  const parentSchema = entityFactory.schema.extended({});
  const articleVersion = entityFactory.articleVersion.basic({});

  const schema = entityFactory.schema.extended({
    parentSchema,
    articleVersion,
  }) as SchemaWithSectionsAggregation;

  return { schema };
};

export const getSchemaAggregationWithoutVersion = (entityFactory: EntityFactoryModule) => {
  const parentSchema = entityFactory.schema.extended({});

  const schema = entityFactory.schema.extended({
    parentSchema,
  }) as SchemaWithSectionsAggregation;

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
    articleVersions: [baseArticleVersion],
  });

  const articleVersion = {
    ...baseArticleVersion,
    articleLanguage: articleLanguage,
  };

  return { articleVersion };
};

export const getSchemaFixture = (schema: Partial<SchemaWithSectionsAggregation> | null) => ({
  sections: schema?.sections || [],
});
