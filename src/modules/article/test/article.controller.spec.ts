import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { ArticleRepository } from '../../../repositories/article.repository';
import { ArticleLanguageRepository } from '../../../repositories/articleLanguage.repository';
import { LanguageRepository } from '../../../repositories/language.repository';

import { ArticleController } from '../article.controller';
import { ArticleService } from '../article.service';

import { PrismaService } from '../../../services/prisma.service';
import { PrismaMock } from '../../../services/prismaMock.service';
import {
  EntityFactory,
  EntityFactoryModule,
} from '../../../test-helpers/entity-factory/entityFactory';

import { DefaultLanguages } from '../../../constants/constants';
import { ArticleAggregation, ArticlesAggregation, LanguageAggregation } from '../article.types';
import { getArticleAggregation, getArticleLanguageWithDraftsAggregation } from './helpers';
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
    it('should successfully return articles', async () => {
      const articleLanguage = entityFactory.articleLanguage.extended({
        language: languages.UA,
        articleVersion: [],
      });

      const article = entityFactory.article.extended({
        articleLanguage: [articleLanguage],
      }) as ArticlesAggregation;

      PrismaMock.article.findMany.mockResolvedValue([article]);

      const articles = await module.articleController.getAllArticles(languages.UA.code);
      expect(articles).toBeTruthy();
      expect(articles).toHaveLength(1);
      expect(articles[0]).toEqual({
        code: article.code,
        type: article.type,
        articleLanguage: {
          name: article.articleLanguage[0].name,
        },
      });
    });

    it('should successfully return empty articles', async () => {
      PrismaMock.article.findMany.mockResolvedValue([]);

      const articles = await module.articleController.getAllArticles(languages.UA.code);

      expect(articles).toEqual([]);
    });

    it('should handle error', async () => {
      const article = entityFactory.article.extended({
        articleLanguage: [],
      }) as ArticlesAggregation;

      PrismaMock.article.findMany.mockResolvedValue([article]);

      expect(() => {
        return module.articleController.getAllArticles(languages.UA.code);
      }).rejects.toThrow(/ArticleLanguage should exist/);
    });
  });

  describe('method: getArticle', () => {
    it('should successfully return article', async () => {
      const { article, articleLanguage, articleVersion } = getArticleAggregation(
        entityFactory,
        languages.UA,
      );

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      const articleResponse = await module.articleController.getArticle(
        article.code,
        languages.UA.code,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,

        languages: [],

        articleLanguage: {
          name: articleLanguage.name,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              body: { content: articleVersion?.schema?.body?.content },
              header: { content: articleVersion?.schema?.header?.content },
            },
          },
        },
      });
    });

    it('should handle article error', async () => {
      const article = entityFactory.article.basic();

      PrismaMock.article.findFirstOrThrow.mockRejectedValue(new Error("Article isn't exist"));

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow("Article isn't exist");
    });

    it('should handle mapping articleLanguage error', async () => {
      const article = entityFactory.article.extended({
        articleLanguage: [],
      }) as ArticleAggregation;

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow('ArticleLanguage should exist');
    });

    it('should handle mapping articleVersion error', async () => {
      const articleLanguage = entityFactory.articleLanguage.extended({
        language: languages.UA,
        articleVersion: [],
      }) as LanguageAggregation;

      const article = entityFactory.article.extended({
        articleLanguage: [articleLanguage],
      }) as ArticleAggregation;

      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(() => {
        return module.articleController.getArticle(article.code, languages.UA.code);
      }).rejects.toThrow('ArticleVersion should exist');
    });
  });

  describe('method: getArticleWithVersions', () => {
    it('should successfully return articles with version', async () => {
      const { article, articleVersion } = getArticleAggregation(entityFactory, languages.UA);

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

    it('should handle not exist error', async () => {
      const article = entityFactory.article.basic();

      PrismaMock.article.findFirstOrThrow.mockRejectedValue(new Error("Article isn't exist"));

      expect(
        module.articleController.getArticleWithVersions(article.code, languages.UA.code),
      ).rejects.toThrow("Article isn't exist");
    });
  });

  describe('method: getArticleDrafts', () => {
    it("should successfully return articles' drafts", async () => {
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
          body: {
            content: articleVersion1?.schema?.body?.content,
          },
          header: {
            content: articleVersion1?.schema?.header?.content,
          },
        },
        drafts: [
          {
            code: schema1.code,
            body: {
              content: schema1.body?.content,
            },
            header: {
              content: schema1.header?.content,
            },
          },
          {
            code: schema2.code,
            body: {
              content: schema2.body?.content,
            },
            header: {
              content: schema2.header?.content,
            },
          },
        ],
      });
    });

    it('should handle language not exist error', async () => {
      const article = entityFactory.article.basic();

      PrismaMock.articleLanguage.findFirstOrThrow.mockRejectedValue(
        new Error("Article language isn't exist"),
      );

      expect(
        module.articleController.getArticleDrafts(article.code, languages.UA.code),
      ).rejects.toThrow("Article language isn't exist");
    });
  });

  describe('method: createArticle', () => {
    it('should successfully create article', async () => {
      const { article, articleLanguage, articleVersion } = getArticleAggregation(
        entityFactory,
        languages.UA,
      );

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.UA);
      PrismaMock.article.create.mockResolvedValue(article);

      const articleResponse = await module.articleController.createArticle(
        languages.UA.code,
        Mock.articleDTOMocks.validArticleMock,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,
        languages: [],
        articleLanguage: {
          name: articleLanguage.name,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              body: { content: articleVersion?.schema?.body?.content },
              header: { content: articleVersion?.schema?.header?.content },
            },
          },
        },
      });
    });

    it('should handle error', async () => {
      const { article } = getArticleAggregation(entityFactory, languages.UA);

      PrismaMock.language.findFirstOrThrow.mockRejectedValue(new Error("Language isn't exist"));
      PrismaMock.article.create.mockResolvedValue(article);

      expect(
        module.articleController.createArticle(article.code, Mock.articleDTOMocks.validArticleMock),
      ).rejects.toThrow("Language isn't exist");
    });
  });

  describe('method: addArticleLanguage', () => {
    it('should successfully add article language', async () => {
      const { article: articleUA } = getArticleAggregation(entityFactory, languages.UA);

      const { article, articleLanguage, articleVersion } = getArticleAggregation(
        entityFactory,
        languages.EN,
      );

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.EN);
      PrismaMock.article.findFirstOrThrow
        // initial check
        .mockResolvedValueOnce(articleUA)
        // update result
        .mockResolvedValueOnce(article);

      const articleResponse = await module.articleController.addArticleLanguage(
        languages.EN.code,
        article.code,
        Mock.articleDTOMocks.validArticleMock,
      );

      expect(articleResponse).toEqual({
        code: article.code,
        type: article.type,
        languages: [],
        articleLanguage: {
          name: articleLanguage.name,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              body: { content: articleVersion?.schema?.body?.content },
              header: { content: articleVersion?.schema?.header?.content },
            },
          },
        },
      });
    });

    it('should not add existing article language', async () => {
      const { article } = getArticleAggregation(entityFactory, languages.UA);

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.UA);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(article);

      expect(
        module.articleController.addArticleLanguage(
          languages.UA.code,
          article.code,
          Mock.articleDTOMocks.validArticleMock,
        ),
      ).rejects.toThrow('ArticleLanguage already exists');
    });

    it('should handle disabled article error', async () => {
      const { article: articleUA } = getArticleAggregation(entityFactory, languages.UA, {
        enabled: false,
      });

      const { article } = getArticleAggregation(entityFactory, languages.EN);

      PrismaMock.language.findFirstOrThrow.mockResolvedValue(languages.EN);
      PrismaMock.article.findFirstOrThrow.mockResolvedValue(articleUA);

      expect(
        module.articleController.addArticleLanguage(
          languages.EN.code,
          article.code,
          Mock.articleDTOMocks.validArticleMock,
        ),
      ).rejects.toThrow('ArticleLanguage should exist');
    });
  });

  describe('method: deleteArticle', () => {
    it('should successfully delete article', async () => {
      const { article } = getArticleAggregation(entityFactory, languages.UA);

      PrismaMock.article.update.mockResolvedValue(article);

      const articleResponse = await module.articleController.deleteArticle(languages.UA.code);

      expect(articleResponse).toEqual({
        code: article.code,
      });
    });
  });

  describe('method: patchArticle', () => {
    it('should successfully update article', async () => {
      const { article, articleLanguage, articleVersion } = getArticleAggregation(
        entityFactory,
        languages.UA,
      );

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
          name: articleLanguage.name,
          version: {
            code: articleVersion.code,
            version: articleVersion.version,
            schema: {
              code: articleVersion?.schema?.code,
              body: { content: articleVersion?.schema?.body?.content },
              header: { content: articleVersion?.schema?.header?.content },
            },
          },
        },
      });
    });
  });
});
