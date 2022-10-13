import { HttpStatus, INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';
import { closeConnection, initTestModule } from '../helpers/hook';
import { ArticleRequest } from '../helpers/request/article/article.request';

describe('Update article flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const Request = {} as {
    article: ArticleRequest;
  };

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());

    Request.article = new ArticleRequest(app);
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA: ArticleResponse;
    createdArticleEN: ArticleResponse;
  };

  it('create and update article', async () => {
    const articleDto = {
      name: 'update_article_test_article_ua_1',
      sections: [
        {
          content: 'section2',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    context.createdArticleUA = await Request.article.patchArticle(
      {
        code: context.createdArticleUA.code,
        languageCode: DefaultLanguages.UA,
        articleDto: {
          enabled: false,
        },
      },
      {
        name: articleDto.name,
        sections: articleDto.sections,
      },
    );
  });

  it('fail to get inactive article', async () => {
    await Request.article.patchArticle({
      code: 'incorrect code',
      languageCode: DefaultLanguages.UA,
      articleDto: {
        enabled: false,
      },
      responseStatus: HttpStatus.NOT_FOUND,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await Request.article.getArticle({
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
    const articleDto = {
      name: 'update_article_test_article_en_2',
      sections: [
        {
          content: 'section4',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleEN = await Request.article.createArticle({
      languageCode: DefaultLanguages.EN,
      articleDto,
    });

    await Request.article.getArticle({
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await Request.article.deleteArticle({
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await Request.article.getArticle({
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

    const errorResponse = await Request.article.deleteArticle({
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
