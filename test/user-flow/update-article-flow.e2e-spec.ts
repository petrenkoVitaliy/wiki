import { HttpStatus, INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';
import { closeConnection, initTestModule } from '../helpers/hook';

import { articleRequest } from '../helpers/request/article.request';

describe('Update article flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA: ArticleResponse;
    createdArticleEN: ArticleResponse;
  };

  it('create and update article', async () => {
    const articleDTO = {
      name: 'update_article_test_article_ua_1',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    context.createdArticleUA = await articleRequest.patchArticle(
      app,
      {
        code: context.createdArticleUA.code,
        languageCode: DefaultLanguages.UA,
        articleDTO: {
          enabled: false,
        },
      },
      {
        name: articleDTO.name,
        body: articleDTO.body,
        header: articleDTO.header,
      },
    );
  });

  it('fail to get inactive article', async () => {
    await articleRequest.patchArticle(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.UA,
      articleDTO: {
        enabled: false,
      },
      responseStatus: HttpStatus.NOT_FOUND,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleUA.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('create and delete article', async () => {
    const articleDTO = {
      name: 'update_article_test_article_en_2',
      body: 'body_2',
      header: 'header_2',
      categoriesIds: [],
    };

    context.createdArticleEN = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
    });

    await articleRequest.getArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await articleRequest.deleteArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await articleRequest.getArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('fail to delete not existing article', async () => {
    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await articleRequest.deleteArticle(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.EN,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });
});
