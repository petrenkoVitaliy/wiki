import { INestApplication } from '@nestjs/common';

import { ArticleResponse, ArticleDraftsResponse } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import { DefaultLanguages } from '../../src/constants/constants';
import { closeConnection, initTestModule } from '../helpers/hook';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { ArticleRequest } from '../helpers/request/article/article.request';
import { SchemaRequest } from '../helpers/request/schema/schema.request';

describe('Article creation flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const Request = {} as {
    article: ArticleRequest;
    schema: SchemaRequest;
  };

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());

    Request.article = new ArticleRequest(app);
    Request.schema = new SchemaRequest(app);
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
    const articleDto = {
      name: 'article_test_article_en_1',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleEN = await Request.article.createArticle({
      languageCode: DefaultLanguages.EN,
      articleDto,
    });
  });

  it('fail to create new article with same name', async () => {
    const articleDto = {
      name: 'article_test_article_en_1',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    const expectedError = ErrorGenerator.notUniqueProperty({ propertyName: 'Article name' });

    const errorResponse = await Request.article.createArticle({
      languageCode: DefaultLanguages.EN,
      articleDto,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('add new language to article', async () => {
    const articleDto = {
      name: 'article_test_article_en_3',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA = await Request.article.addArticleLanguage(
      {
        languageCode: DefaultLanguages.UA,
        articleDto,
        articleCode: context.createdArticleEN.code,
      },
      { createdLanguages: [DefaultLanguages.EN], articleDto },
    );
  });

  it('create new draft 1', async () => {
    const schemaDto = {
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;

    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft1 = await Request.schema.createDraft(
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDto,
      },
      { basicSchema, schemaDto },
    );
  });

  it('create new draft 2', async () => {
    const schemaDto = {
      sections: [
        {
          content: 'section2',
          name: 'name',
        },
      ],
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;
    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft2 = await Request.schema.createDraft(
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDto,
      },
      { basicSchema, schemaDto },
    );
  });

  it('get article drafts', async () => {
    context.articleDrafts1 = await Request.article.getArticleDrafts(
      {
        languageCode: DefaultLanguages.UA,
        articleCode: context.createdArticleUA.code,
      },
      {
        article: context.createdArticleUA,
        articleVersions: [
          {
            version: context.createdArticleUA.articleLanguage.version.version,
            schemaDto: {
              sections: context.createdArticleUA.articleLanguage.version.schema.sections,
            },
            drafts: [context.createdDraft1, context.createdDraft2],
          },
        ],
      },
    );
  });

  it('get article', async () => {
    await Request.article.getArticle(
      {
        languageCode: DefaultLanguages.UA,
        code: context.createdArticleUA.code,
      },
      {
        code: context.createdArticleUA.code,
        articleResponse: context.createdArticleUA,
        createdLanguages: [DefaultLanguages.EN],
      },
    );
  });
});
