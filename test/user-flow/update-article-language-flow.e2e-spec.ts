import { HttpStatus, INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';

import { DefaultLanguages } from '../../src/constants/constants';
import { MappedArticle } from '../../src/modules/article/article.types';

import { articleRequest } from '../helpers/request/article.request';
import { articleLanguageRequest } from '../helpers/request/article-language.request';

describe('User flow: update article language', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA1: MappedArticle;
    createdArticleUA3: MappedArticle;
    createdArticleUA4: MappedArticle;
  };

  it('Should successfully create and update article language', async () => {
    const articleDTO = {
      name: 'article_language_test_article_ua_1',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA1 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
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

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleUA1.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });

    expect(errorResponse).toEqual({
      message: "Article isn't exist",
      statusCode: HttpStatus.NOT_FOUND,
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

  it('Should successfully create and delete article language', async () => {
    const articleDTO = {
      name: 'article_language_test_article_ua_3',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA3 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    await articleLanguageRequest.deleteArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA3.articleLanguage.code,
      articleCode: context.createdArticleUA3.code,
    });

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleUA3.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });

    expect(errorResponse).toEqual({
      message: "Article isn't exist",
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('Should successfully create delete and handle recreating error article language', async () => {
    const articleDTO = {
      name: 'article_language_test_article_ua_4',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA4 = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    await articleLanguageRequest.deleteArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA4.articleLanguage.code,
      articleCode: context.createdArticleUA4.code,
    });

    const errorResponse = await articleRequest.addArticleLanguage(app, {
      languageCode: DefaultLanguages.UA,
      articleCode: context.createdArticleUA4.code,
      articleDTO: {
        ...articleDTO,
      },
      responseStatus: HttpStatus.BAD_REQUEST,
    });

    expect(errorResponse).toEqual({
      message: 'ArticleLanguage already exists',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});
