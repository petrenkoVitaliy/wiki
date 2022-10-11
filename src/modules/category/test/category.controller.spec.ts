import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { CategoryRepository } from '../../../repositories/category.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaMock } from '../../../prisma/prismaMock.service';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';

import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';
import { DefaultLanguages } from '../../../constants/constants';

describe('CategoryController', () => {
  const module = {} as {
    categoryController: CategoryController;
  };

  const languages = {} as { [key in DefaultLanguages]: Language };

  let entityFactory: EntityFactoryModule;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService, PrismaService, CategoryRepository],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMock)
      .compile();

    module.categoryController = app.get<CategoryController>(CategoryController);

    entityFactory = await EntityFactory.initiate();

    languages.UA = entityFactory.language.basic({ code: DefaultLanguages.UA });
    languages.EN = entityFactory.language.basic({ code: DefaultLanguages.EN });
  });

  describe('method: getCategoriesMap', () => {
    it('return categories map', async () => {
      const articleLanguage = entityFactory.articleLanguage.extended({
        language: languages.UA,
        articleVersions: [],
      });

      const article = entityFactory.article.extended({
        articleLanguages: [articleLanguage],
      });

      const category1 = entityFactory.category.extended({
        articles: [article],
      });

      const category2 = entityFactory.category.extended({
        articles: [article],
        parentId: category1.id,
      });

      PrismaMock.category.findMany.mockResolvedValue([category1, category2]);

      const categoriesTree = await module.categoryController.getCategoriesMap(languages.UA.code);

      expect(categoriesTree).toEqual([
        {
          id: category1.id,
          name: category1.name,
          description: category1.description,
          parentId: category1.parentId,
          articles: [
            {
              type: article.type,
              name: articleLanguage.name,
              code: article.code,
            },
          ],
          children: [
            {
              id: category2.id,
              name: category2.name,
              description: category2.description,
              parentId: category2.parentId,
              articles: [
                {
                  type: article.type,
                  name: articleLanguage.name,
                  code: article.code,
                },
              ],
              children: [],
            },
          ],
        },
      ]);
    });
  });
});
