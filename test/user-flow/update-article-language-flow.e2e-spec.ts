import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';
import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { ArticleLanguageRequest } from '../helpers/request/article-language/article-language.request';
import { ArticleRequest } from '../helpers/request/article/article.request';

describe('Update article language flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const Request = {} as {
    article: ArticleRequest;
    articleLanguage: ArticleLanguageRequest;
  };

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());

    Request.article = new ArticleRequest(app);
    Request.articleLanguage = new ArticleLanguageRequest(app);
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
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA1 = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await Request.articleLanguage.patchArticleLanguage({
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA1.articleLanguage.code,
      articleCode: context.createdArticleUA1.code,
      articleLanguageDto: {
        name: 'article_language_test_article_ua_2',
        enabled: false,
      },
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await Request.article.getArticle({
      code: context.createdArticleUA1.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });

    await Request.articleLanguage.patchArticleLanguage({
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA1.articleLanguage.code,
      articleCode: context.createdArticleUA1.code,
      articleLanguageDto: {
        enabled: true,
      },
    });

    context.createdArticleUA1 = await Request.article.getArticle({
      code: context.createdArticleUA1.code,
      languageCode: DefaultLanguages.UA,
    });
  });

  it('create and delete article language', async () => {
    const articleDto = {
      name: 'article_language_test_article_ua_3',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA3 = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await Request.articleLanguage.deleteArticleLanguage({
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA3.articleLanguage.code,
      articleCode: context.createdArticleUA3.code,
    });

    const expectedError = ErrorGenerator.notFound({ entityName: 'Article' });

    const errorResponse = await Request.article.getArticle({
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
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA4 = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    await Request.articleLanguage.deleteArticleLanguage({
      languageCode: DefaultLanguages.UA,
      code: context.createdArticleUA4.articleLanguage.code,
      articleCode: context.createdArticleUA4.code,
    });

    const expectedError = ErrorGenerator.duplicateEntity({ entityName: 'ArticleLanguage' });

    const errorResponse = await Request.article.addArticleLanguage({
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
