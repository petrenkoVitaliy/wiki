import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { ArticleRepository } from '../../../repositories/article.repository';
import { ArticleLanguageRepository } from '../../../repositories/articleLanguage.repository';
import { LanguageRepository } from '../../../repositories/language.repository';

import { ArticleController } from '../article.controller';

import { ArticleService } from '../article.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaMock } from '../../../prisma/prismaMock.service';

import { DefaultLanguages } from '../../../constants/constants';
import { ArticleAggregation, ArticlesAggregation, LanguageAggregation } from '../article.types';
import { getArticleAggregation, getArticleLanguageWithDraftsAggregation } from './helpers';
import { ErrorGenerator } from '../../../utils/error.generator';

import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';
import { Mock } from './mock';

describe('ArticleController', () => {
  const module = {} as {
    articleController: ArticleController;
  };

  const languages = {} as { [key in DefaultLanguages]: Language };

  let entityFactory: EntityFactoryModule;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        ArticleService,
        PrismaService,

        ArticleRepository,
        ArticleLanguageRepository,
        LanguageRepository,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMock)
      .compile();

    module.articleController = app.get<ArticleController>(ArticleController);

    entityFactory = await EntityFactory.initiate();

    languages.UA = entityFactory.language.basic({ code: DefaultLanguages.UA });
    languages.EN = entityFactory.language.basic({ code: DefaultLanguages.EN });
  });

  describe('method: getAllArticles', () => {
    it('return articles', async () => {
      const articleLanguage = entityFactory.articleLanguage.extended({
        language: languages.UA,
        articleVersions: [],
      });

      const article = entityFactory.article.extended({
        articleLanguages: [articleLanguage],
      }) as ArticlesAggregation;

      PrismaMock.article.findMany.mockResolvedValue([article]);

      const articles = await module.articleController.getAllArticles(languages.UA.code);
      expect(articles).toBeTruthy();
      expect(articles).toHaveLength(1);
      expect(articles[0]).toEqual({
        code: article.code,
        type: article.type,
        articleLanguage: {
          name: article.articleLanguages[0].name,
        },
      });
    });

    it('return empty articles', async () => {
      PrismaMock.article.findMany.mockResolvedValue([]);

      const articles = await module.articleController.getAllArticles(languages.UA.code);

      expect(articles).toEqual([]);
    });

    it('handle error', async () => {
      const article = entityFactory.article.extended({
        articleLanguages: [],
      }) as ArticlesAggregation;

      PrismaMock.article.findMany.mockResolvedValue([article]);

      expect(() => {
        return module.articleController.getAllArticles(languages.UA.code);
      }).rejects.toThrow(ErrorGenerator.invalidEntity({ entityName: 'ArticleLanguage' }).message);
    });
  });

  describe('method: getArticle', () => {
    it('return article', async () => {
      const { article, articleLanguages, articleVersion } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA, languages.EN],
      });

      const articleLanguageUA = articleLanguages.find(
        (articleLanguage) => articleLanguage.language.code === languages.UA.code,
      ) as LanguageAggregation;

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      const articleResponse = await module.articleController.getArticle(
        article.code,
        languages.UA.code,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,

        languages: [languages.EN.code],

        articleLanguage: {
          name: articleLanguageUA.name,
          code: articleLanguageUA.code,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              section: articleVersion?.schema?.sections,
            },
          },
        },
      });
    });

    it('handle not found Article error', async () => {
      const article = entityFactory.article.basic();

      const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });
      PrismaMock.article.findFirstOrThrow.mockRejectedValue(expectedError.message);

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow(expectedError.message);
    });

    it('handle invalid ArticleLanguage error', async () => {
      const article = entityFactory.article.extended({
        articleLanguages: [],
      }) as ArticleAggregation;

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow(ErrorGenerator.invalidEntity({ entityName: 'ArticleLanguage' }).message);
    });

    it('handle invalid ArticleVersion error', async () => {
      const articleLanguage = entityFactory.articleLanguage.extended({
        language: languages.UA,
        articleVersions: [],
      }) as LanguageAggregation;

      const article = entityFactory.article.extended({
        articleLanguages: [articleLanguage],
      }) as ArticleAggregation;

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow(ErrorGenerator.invalidEntity({ entityName: 'ArticleVersion' }).message);
    });
  });

  describe('method: getArticleWithVersions', () => {
    it('return articles with version', async () => {
      const { article, articleVersion } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      const articleResponse = await module.articleController.getArticleWithVersions(
        article.code,
        languages.UA.code,
      );

      expect(articleResponse).toEqual([
        {
          code: articleVersion.code,
          version: articleVersion.version,
        },
      ]);
    });

    it('handle not found Article error', async () => {
      const article = entityFactory.article.basic();

      const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });
      PrismaMock.article.findFirstOrThrow.mockRejectedValue(expectedError.message);

      expect(
        module.articleController.getArticleWithVersions(article.code, languages.UA.code),
      ).rejects.toThrow(expectedError.message);
    });
  });

  describe('method: getArticleDrafts', () => {
    it('return article drafts', async () => {
      const { schema1, schema2, articleLanguage, articleVersion1 } =
        getArticleLanguageWithDraftsAggregation(entityFactory);

      PrismaMock.articleLanguage.findFirstOrThrow.mockResolvedValue(articleLanguage);

      const articlesWithDrafts = await module.articleController.getArticleDrafts(
        articleLanguage.article.code,
        languages.UA.code,
      );

      expect(articlesWithDrafts).toBeTruthy();

      expect(articlesWithDrafts).toMatchObject({
        code: articleLanguage.article.code,
        articleLanguage: {
          name: articleLanguage.name,
          code: articleLanguage.code,
        },
      });

      expect(articlesWithDrafts.articleVersions).toHaveLength(2);

      expect(articlesWithDrafts.articleVersions[0]).toEqual({
        version: articleVersion1.version,
        code: articleVersion1.code,
        schema: {
          code: articleVersion1?.schema?.code,
          section: articleVersion1?.schema?.sections,
        },
        drafts: [
          {
            code: schema1.code,
            section: articleVersion1?.schema?.sections,
          },
          {
            code: schema2.code,
            section: articleVersion1?.schema?.sections,
          },
        ],
      });
    });

    it('handle not found ArticleLanguage error', async () => {
      const article = entityFactory.article.basic();

      const expectedError = ErrorGenerator.notFound({ entityName: 'ArticleLanguage' });
      PrismaMock.articleLanguage.findFirstOrThrow.mockRejectedValue(expectedError.message);

      expect(
        module.articleController.getArticleDrafts(article.code, languages.UA.code),
      ).rejects.toThrow(expectedError.message);
    });
  });

  describe('method: createArticle', () => {
    it('create article', async () => {
      const { article, articleLanguages, articleVersion } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.UA);
      PrismaMock.article.create.mockResolvedValue(article);

      const articleResponse = await module.articleController.createArticle(
        languages.UA.code,
        Mock.articleDtoMocks.validArticleMock,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,
        languages: [],
        articleLanguage: {
          name: articleLanguages[0].name,
          code: articleLanguages[0].code,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              section: articleVersion?.schema?.sections,
            },
          },
        },
      });
    });

    it('handle not found Language error', async () => {
      const { article } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      const expectedError = ErrorGenerator.notFound({ entityName: 'Language' });
      PrismaMock.language.findFirstOrThrow.mockRejectedValue(expectedError.message);
      PrismaMock.article.create.mockResolvedValue(article);

      expect(
        module.articleController.createArticle(article.code, Mock.articleDtoMocks.validArticleMock),
      ).rejects.toThrow(expectedError.message);
    });
  });

  describe('method: addArticleLanguage', () => {
    it('add article language', async () => {
      const { article: articleUA } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      const { article, articleLanguages, articleVersion } = getArticleAggregation({
        entityFactory,
        languages: [languages.EN],
      });

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.EN);
      PrismaMock.article.findFirstOrThrow
        // initial check
        .mockResolvedValueOnce(articleUA)
        // update result
        .mockResolvedValueOnce(article);

      const articleResponse = await module.articleController.addArticleLanguage(
        languages.EN.code,
        article.code,
        Mock.articleDtoMocks.validArticleMock,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,
        languages: [],
        articleLanguage: {
          name: articleLanguages[0].name,
          code: articleLanguages[0].code,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              section: articleVersion?.schema?.sections,
            },
          },
        },
      });
    });

    it('handle duplicate ArticleLanguage error', async () => {
      const { article } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.UA);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(
        module.articleController.addArticleLanguage(
          languages.UA.code,
          article.code,
          Mock.articleDtoMocks.validArticleMock,
        ),
      ).rejects.toThrow(ErrorGenerator.duplicateEntity({ entityName: 'ArticleLanguage' }));
    });

    it('handle invalid ArticleLanguage error', async () => {
      const { article: articleUA } = getArticleAggregation(
        {
          entityFactory,
          languages: [languages.UA],
        },
        {
          enabled: false,
        },
      );

      const { article } = getArticleAggregation({
        entityFactory,
        languages: [languages.EN],
      });

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.EN);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(articleUA);

      expect(
        module.articleController.addArticleLanguage(
          languages.EN.code,
          article.code,
          Mock.articleDtoMocks.validArticleMock,
        ),
      ).rejects.toThrow(ErrorGenerator.invalidEntity({ entityName: 'ArticleLanguage' }));
    });
  });

  describe('method: deleteArticle', () => {
    it('delete article', async () => {
      const { article } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      PrismaMock.article.update.mockResolvedValue(article);

      const articleResponse = await module.articleController.deleteArticle(languages.UA.code);

      expect(articleResponse).toEqual({
        code: article.code,
      });
    });
  });

  describe('method: patchArticle', () => {
    it('update article', async () => {
      const { article, articleLanguages, articleVersion } = getArticleAggregation({
        entityFactory,
        languages: [languages.UA],
      });

      PrismaMock.article.update.mockResolvedValue(article);

      const articleResponse = await module.articleController.patchArticle(
        article.code,
        languages.UA.code,
        {
          enabled: false,
        },
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,
        languages: [],
        articleLanguage: {
          name: articleLanguages[0].name,
          code: articleLanguages[0].code,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              section: articleVersion?.schema?.sections,
            },
          },
        },
      });
    });
  });
});
