import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { ArticleVersionRepository } from '../../../repositories/articleVersion.repository';
import { SchemaRepository } from '../../../repositories/schema.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaMock } from '../../../prisma/prismaMock.service';
import { SchemaController } from '../schema.controller';
import { SchemaService } from '../schema.service';
import {
  getArticleVersionWithSiblings,
  getSchemaAggregation,
  getSchemaAggregationWithoutVersion,
  getSchemaFixture,
  getSingleArticleVersionWithSiblings,
} from './helpers';

import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';
import { DefaultLanguages } from '../../../constants/constants';
import { schemaDTOMocks } from './mock/schema.mock';
import { ErrorGenerator } from '../../../utils/error.generator';

describe('SchemaController', () => {
  const module = {} as {
    schemaController: SchemaController;
  };

  const languages = {} as { [key in DefaultLanguages]: Language };

  let entityFactory: EntityFactoryModule;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SchemaController],
      providers: [SchemaService, PrismaService, ArticleVersionRepository, SchemaRepository],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMock)
      .compile();

    module.schemaController = app.get<SchemaController>(SchemaController);

    entityFactory = await EntityFactory.initiate();

    languages.UA = entityFactory.language.basic({ code: DefaultLanguages.UA });
    languages.EN = entityFactory.language.basic({ code: DefaultLanguages.EN });
  });

  describe('method: getSchema', () => {
    it('return schema [renovation:false]', async () => {
      const { schema } = getSchemaAggregation(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.findFirstOrThrow.mockResolvedValue(schema);

      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.getSchema(
        schema.code,
        articleVersion.code,
        languages.UA.code,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: false,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });

    it('return schema [renovation:true]', async () => {
      const { schema } = getSchemaAggregationWithoutVersion(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.findFirstOrThrow.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.getSchema(
        schema.code,
        articleVersion.code,
        languages.UA.code,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: true,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });
  });

  describe('method: createDraftSchema', () => {
    it('create draft schema [renovation:true]', async () => {
      const { schema } = getSchemaAggregation(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);
      const { articleVersion: articleVersionSibling } =
        getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.create.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow
        .mockResolvedValueOnce(articleVersion)
        .mockResolvedValueOnce(articleVersionSibling);

      const schemaAggregation = await module.schemaController.createDraftSchema(
        articleVersion.code,
        languages.UA.code,
        schemaDTOMocks.validSchemaMock,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: true,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });

    it('create draft schema [renovation:false]', async () => {
      const { schema } = getSchemaAggregation(entityFactory);
      const { articleVersion } = getSingleArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.create.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.createDraftSchema(
        articleVersion.code,
        languages.UA.code,
        schemaDTOMocks.validSchemaMock,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: false,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });
  });

  describe('method: updateDraftSchema', () => {
    it('update draft schema [renovation:false]', async () => {
      const { schema } = getSchemaAggregation(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.update.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.updateDraftSchema(
        schema.code,
        languages.UA.code,
        articleVersion.code,
        schemaDTOMocks.validSchemaMock,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: false,
        parentSchema: { ...getSchemaFixture(schema.parentSchema) },
      });
    });

    it('update draft schema [renovation:true]', async () => {
      const { schema } = getSchemaAggregationWithoutVersion(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.update.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.updateDraftSchema(
        schema.code,
        languages.UA.code,
        articleVersion.code,
        schemaDTOMocks.validSchemaMock,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: true,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });
  });

  describe('method: renovateDraftSchema', () => {
    it('handle already actual schema error', async () => {
      const { schema } = getSchemaAggregation(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.update.mockResolvedValue(schema);
      PrismaMock.schema.findFirstOrThrow.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      expect(
        module.schemaController.renovateDraftSchema(
          schema.code,
          languages.UA.code,
          articleVersion.code,
          schemaDTOMocks.validSchemaMock,
        ),
      ).rejects.toThrow(ErrorGenerator.alreadyActualSchema());
    });

    it('renovate draft schema', async () => {
      const { schema } = getSchemaAggregationWithoutVersion(entityFactory);
      const { articleVersion } = getArticleVersionWithSiblings(entityFactory);

      PrismaMock.schema.update.mockResolvedValue(schema);
      PrismaMock.schema.findFirstOrThrow.mockResolvedValue(schema);
      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const schemaAggregation = await module.schemaController.renovateDraftSchema(
        schema.code,
        languages.UA.code,
        articleVersion.code,
        schemaDTOMocks.validSchemaMock,
      );

      expect(schemaAggregation).toEqual({
        ...getSchemaFixture(schema),
        code: schema.code,
        shouldBeRenovated: false,
        parentSchema: {
          ...getSchemaFixture(schema.parentSchema),
        },
      });
    });
  });

  describe('method: approveDraft', () => {
    it('handle already approved schema error [invalid schema]', async () => {
      const schema1 = entityFactory.schema.extended({});
      const schema2 = entityFactory.schema.extended({});
      const schemaToApprove = entityFactory.schema.extended({
        parentSchema: schema1,
      });
      const articleVersion1 = entityFactory.articleVersion.extended({
        schema: schema2,
      });

      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion1);
      PrismaMock.schema.findUniqueOrThrow.mockResolvedValue(schemaToApprove);

      expect(
        module.schemaController.approveDraft(
          schemaToApprove.code,
          languages.UA.code,
          articleVersion1.code,
        ),
      ).rejects.toThrow(ErrorGenerator.alreadyApprovedSchema());
    });

    it('handle already approved schema error [primary schema', async () => {
      const schema1 = entityFactory.schema.extended({});
      const schemaToApprove = entityFactory.schema.extended({});
      const articleVersion1 = entityFactory.articleVersion.extended({
        schema: schema1,
      });

      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion1);
      PrismaMock.schema.findUniqueOrThrow.mockResolvedValue(schemaToApprove);

      expect(
        module.schemaController.approveDraft(
          schemaToApprove.code,
          languages.UA.code,
          articleVersion1.code,
        ),
      ).rejects.toThrow(ErrorGenerator.alreadyApprovedSchema());
    });

    it('approve draft schema', async () => {
      const schema1 = entityFactory.schema.extended({});
      const schemaToApprove = entityFactory.schema.extended({
        parentSchema: schema1,
      });
      const articleVersion1 = entityFactory.articleVersion.extended({
        schema: schema1,
      });
      const articleVersion2 = entityFactory.articleVersion.extended({
        schema: schemaToApprove,
      });

      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion1);
      PrismaMock.schema.findUniqueOrThrow.mockResolvedValue(schemaToApprove);

      PrismaMock.$transaction.mockResolvedValue([undefined, undefined, articleVersion2]);

      const createdArticleVersion = await module.schemaController.approveDraft(
        schemaToApprove.code,
        languages.UA.code,
        articleVersion1.code,
      );

      expect(createdArticleVersion).toEqual({
        code: articleVersion2.code,
        version: 1,
        schema: {
          code: articleVersion2.schema?.code,
          header: {
            content: articleVersion2.schema?.header?.content,
          },
          body: {
            content: articleVersion2.schema?.body?.content,
          },
        },
      });
    });
  });
});
