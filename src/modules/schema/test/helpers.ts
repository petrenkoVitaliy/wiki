import { EntityFactoryModule } from '../../../test-helpers/entity-factory/entityFactory';
import { SchemaWithSectionsAggregation } from '../schema.types';

export const getSchemaAggregation = (entityFactory: EntityFactoryModule) => {
  const sections1 = [1, 2].map((index) => entityFactory.section.extended({ order: index }));
  const sections2 = [1, 2, 3, 4, 5].map((index) =>
    entityFactory.section.extended({ order: index }),
  );

  const parentSchema = entityFactory.schema.extended({ sections: sections1 });
  const articleVersion = entityFactory.articleVersion.basic({});

  const schema = entityFactory.schema.extended({
    parentSchema,
    articleVersion,
    sections: sections2,
  }) as SchemaWithSectionsAggregation;

  return { schema };
};

export const getSchemaAggregationWithoutVersion = (entityFactory: EntityFactoryModule) => {
  const sections1 = [1, 2].map((order) => entityFactory.section.extended({ order }));
  const sections2 = [1, 2, 3, 4, 5].map((order) => entityFactory.section.extended({ order }));

  const parentSchema = entityFactory.schema.extended({ sections: sections1 });

  const schema = entityFactory.schema.extended({
    parentSchema,
    sections: sections2,
  }) as SchemaWithSectionsAggregation;

  return { schema };
};

export const getArticleVersionWithSiblings = (entityFactory: EntityFactoryModule) => {
  const sections = [1, 2].map((order) => entityFactory.section.extended({ order }));

  const schema = entityFactory.schema.extended({ sections });

  const articleVersion = entityFactory.articleVersion.extended({
    schema,
    actual: true,
  });

  return { articleVersion };
};

export const getSingleArticleVersionWithSiblings = (entityFactory: EntityFactoryModule) => {
  const sections = [1, 2].map((order) => entityFactory.section.extended({ order }));

  const schema = entityFactory.schema.extended({ sections });
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
  sections:
    schema?.sections?.map(({ section }) => ({
      name: section.name,
      content: section.content,
    })) || [],
});
