import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';
import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { articleRequest } from '../helpers/request/article.request';
import { articleLanguageRequest } from '../helpers/request/article-language.request';

describe('Update article language flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA1: ArticleResponse;
    createdArticleUA3: ArticleResponse;
    createdArticleUA4: ArticleResponse;
  };

  it('create and update article language', async () => {
    const articleDto = {
      name: 'article_language_test_article_ua_1',
      section: ['section1'],
      categoriesIds: [],
    };

    context.createdArticleUA1 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await articleLanguageRequest.patchArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA1.articleLanguage.code,
      articleCode: context.createdArticleUA1.code,
      articleLanguageDto: {
        name: 'article_language_test_article_ua_2',
        enabled: false,
      },
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleUA1.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });

    await articleLanguageRequest.patchArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA1.articleLanguage.code,
      articleCode: context.createdArticleUA1.code,
      articleLanguageDto: {
        enabled: true,
      },
    });

    context.createdArticleUA1 = await articleRequest.getArticle(app, {
      code: context.createdArticleUA1.code,
      languageCode: DefaultLanguages.UA,
    });
  });

  it('create and delete article language', async () => {
    const articleDto = {
      name: 'article_language_test_article_ua_3',
      section: ['section1'],
      categoriesIds: [],
    };

    context.createdArticleUA3 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await articleLanguageRequest.deleteArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA3.articleLanguage.code,
      articleCode: context.createdArticleUA3.code,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleUA3.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('create, delete and handle recreating error article language', async () => {
    const articleDto = {
      name: 'article_language_test_article_ua_4',
      section: ['section1'],
      categoriesIds: [],
    };

    context.createdArticleUA4 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await articleLanguageRequest.deleteArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA4.articleLanguage.code,
      articleCode: context.createdArticleUA4.code,
    });

    const expectedError = ErrorGenerator.duplicateEntity({ entityName: 'ArticleLanguage' });

    const errorResponse = await articleRequest.addArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      articleCode: context.createdArticleUA4.code,
      articleDto: {
        ...articleDto,
      },
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });
});
