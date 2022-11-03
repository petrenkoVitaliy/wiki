import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { ArticleVersionRepository } from '../../../repositories/articleVersion.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaMock } from '../../../prisma/prismaMock.service';
import { ArticleVersionController } from '../articleVersion.controller';
import { ArticleVersionService } from '../articleVersion.service';

import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';
import { DefaultLanguages } from '../../../constants/constants';
import { ArticleVersionAggregation } from '../articleVersion.types';
import { ErrorGenerator } from '../../../utils/error.generator';

describe('ArticleVersionController', () => {
  const module = {} as {
    articleVersionController: ArticleVersionController;
  };

  const languages = {} as { [key in DefaultLanguages]: Language };

  let entityFactory: EntityFactoryModule;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArticleVersionController],
      providers: [ArticleVersionService, PrismaService, ArticleVersionRepository],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMock)
      .compile();

    module.articleVersionController = app.get<ArticleVersionController>(ArticleVersionController);

    entityFactory = await EntityFactory.initiate();

    languages.UA = entityFactory.language.basic({ code: DefaultLanguages.UA });
    languages.EN = entityFactory.language.basic({ code: DefaultLanguages.EN });
  });

  describe('method: patchArticleVersion', () => {
    it('patch article version', async () => {
      const sections = [1, 2].map((order) => entityFactory.section.extended({ order }));
      const schema = entityFactory.schema.extended({ sections });
      const articleVersion = entityFactory.articleVersion.extended({
        schema,
        enabled: false,
      }) as ArticleVersionAggregation;

      PrismaMock.articleVersion.update.mockResolvedValue(articleVersion);

      const updatedArticleVersion = await module.articleVersionController.patchArticleVersion(
        articleVersion.code,
        {
          enabled: false,
        },
      );

      expect(updatedArticleVersion).toEqual({
        code: articleVersion.code,
        version: articleVersion.version,
        schema: {
          code: schema.code,
          sections: schema?.sections?.map(({ section }) => ({
            name: section.name,
            content: section.content,
          })),
        },
      });
    });
  });

  describe('method: deleteArticleVersion', () => {
    it('delete article version', async () => {
      const sections = [1, 2].map((order) => entityFactory.section.extended({ order }));
      const schema = entityFactory.schema.extended({ sections });
      const articleVersion = entityFactory.articleVersion.extended({
        schema,
        enabled: false,
      }) as ArticleVersionAggregation;

      PrismaMock.articleVersion.update.mockResolvedValue(articleVersion);

      const deletedArticleVersion = await module.articleVersionController.deleteArticleVersion(
        articleVersion.code,
      );

      expect(deletedArticleVersion).toEqual({
        code: articleVersion.code,
      });
    });
  });

  describe('method: getArticleVersion', () => {
    it('return article version', async () => {
      const sections = [1, 2].map((order) => entityFactory.section.extended({ order }));
      const schema = entityFactory.schema.extended({ sections });
      const articleVersion = entityFactory.articleVersion.extended({
        schema,
      }) as ArticleVersionAggregation;

      PrismaMock.articleVersion.findFirstOrThrow.mockResolvedValue(articleVersion);

      const articleVersionResponse = await module.articleVersionController.getArticleVersion(
        languages.UA.code,
        articleVersion.code,
      );

      expect(articleVersionResponse).toEqual({
        code: articleVersion.code,
        version: articleVersion.version,
        schema: {
          code: schema.code,
          sections: schema?.sections?.map(({ section }) => ({
            name: section.name,
            content: section.content,
          })),
        },
      });
    });

    it('handle not found ArticleVersion error', async () => {
      const articleVersion = entityFactory.articleVersion.basic({});

      const expectedError = ErrorGenerator.notFound({ entityName: 'ArticleVersion' });
      PrismaMock.articleVersion.findFirstOrThrow.mockRejectedValue(expectedError.message);

      expect(
        module.articleVersionController.getArticleVersion(languages.UA.code, articleVersion.code),
      ).rejects.toThrow(expectedError.message);
    });
  });
});
