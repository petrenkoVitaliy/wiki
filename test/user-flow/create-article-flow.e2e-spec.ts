import { INestApplication } from '@nestjs/common';

import { ArticleResponse, ArticleDraftsResponse } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import { DefaultLanguages } from '../../src/constants/constants';
import { closeConnection, initTestModule } from '../helpers/hook';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { articleRequest } from '../helpers/request/article.request';
import { schemaRequest } from '../helpers/request/schema.request';

describe('Article creation flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleEN: ArticleResponse;
    createdArticleUA: ArticleResponse;
    createdDraft1: SchemaResponse;
    createdDraft2: SchemaResponse;
    articleDrafts1: ArticleDraftsResponse;
  };

  it('create new article', async () => {
    const articleDTO = {
      name: 'article_test_article_en_1',
      body: 'body_en_1',
      header: 'header_en_1',
      categoriesIds: [],
    };

    context.createdArticleEN = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
    });
  });

  it('fail to create new article with same name', async () => {
    const articleDTO = {
      name: 'article_test_article_en_1',
      body: 'body_en_1',
      header: 'header_en_1',
      categoriesIds: [],
    };

    const expectedError = ErrorGenerator.notUniqueProperty({ propertyName: 'Article name' });

    const errorResponse = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('add new language to article', async () => {
    const articleDTO = {
      name: 'article_test_article_en_3',
      body: 'body_ua_1',
      header: 'header_ua_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await articleRequest.addArticleLanguage(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleDTO,
        articleCode: context.createdArticleEN.code,
      },
      { createdLanguages: [DefaultLanguages.EN] },
    );
  });

  it('create new draft 1', async () => {
    const schemaDTO = {
      body: 'body_ua_2',
      header: 'header_ua_2',
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;

    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft1 = await schemaRequest.createDraft(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO,
      },
      { basicSchema },
    );
  });

  it('create new draft 2', async () => {
    const schemaDTO = {
      body: 'body_ua_3',
      header: 'header_ua_3',
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;
    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft2 = await schemaRequest.createDraft(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO,
      },
      { basicSchema },
    );
  });

  it('get article drafts', async () => {
    context.articleDrafts1 = await articleRequest.getArticleDrafts(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleCode: context.createdArticleUA.code,
      },
      {
        article: context.createdArticleUA,
        articleVersions: [
          {
            version: context.createdArticleUA.articleLanguage.version.version,
            schemaDTO: {
              body: context.createdArticleUA.articleLanguage.version.schema.body?.content,
              header: context.createdArticleUA.articleLanguage.version.schema.header?.content,
            },
            drafts: [context.createdDraft1, context.createdDraft2],
          },
        ],
      },
    );
  });

  it('get article', async () => {
    await articleRequest.getArticle(
      app,
      {
        languageCode: DefaultLanguages.UA,
        code: context.createdArticleUA.code,
      },
      {
        articleLanguageName: context.createdArticleUA.articleLanguage.name,
        createdLanguages: [DefaultLanguages.EN],
      },
    );
  });
});
