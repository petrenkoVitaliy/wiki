import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';
import { DefaultLanguages } from '../../../constants/constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaMock } from '../../../prisma/prismaMock.service';
import { ArticleLanguageRepository } from '../../../repositories/articleLanguage.repository';
import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';
import { ArticleLanguageController } from '../articleLanguage.controller';
import { PatchArticleLanguageDto } from '../articleLanguage.dtos';
import { ArticleLanguageService } from '../articleLanguage.service';

describe('ArticleLanguageController', () => {
  const module = {} as {
    articleLanguageController: ArticleLanguageController;
  };

  const languages = {} as { [key in DefaultLanguages]: Language };

  let entityFactory: EntityFactoryModule;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArticleLanguageController],
      providers: [ArticleLanguageService, ArticleLanguageRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMock)
      .compile();

    module.articleLanguageController =
      app.get<ArticleLanguageController>(ArticleLanguageController);

    entityFactory = await EntityFactory.initiate();

    languages.UA = entityFactory.language.basic({ code: DefaultLanguages.UA });
    languages.EN = entityFactory.language.basic({ code: DefaultLanguages.EN });
  });
  describe('method: patchArticleLanguage', () => {
    it('should successfully update article language', async () => {
      const articleLanguage = entityFactory.articleLanguage.basic({});

      const patchArticleLanguageDto: PatchArticleLanguageDto = {
        enabled: false,
      };

      PrismaMock.articleLanguage.update.mockResolvedValue({ ...articleLanguage, enabled: false });

      const updatedArticleLanguage = await module.articleLanguageController.patchArticleLanguage(
        articleLanguage.code,
        patchArticleLanguageDto,
      );

      expect(updatedArticleLanguage).toEqual({
        code: articleLanguage.code,
        name: articleLanguage.name,
      });
    });

    it('should successfully delete article language', async () => {
      const articleLanguage = entityFactory.articleLanguage.basic({});

      PrismaMock.articleLanguage.update.mockResolvedValue({ ...articleLanguage, archived: true });

      const updatedArticleLanguage = await module.articleLanguageController.deleteArticleLanguage(
        articleLanguage.code,
      );

      expect(updatedArticleLanguage).toEqual({
        code: articleLanguage.code,
        name: articleLanguage.name,
      });
    });
  });
});
