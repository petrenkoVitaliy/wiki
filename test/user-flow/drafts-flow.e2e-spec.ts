import { INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse, ArticleDraftsResponse } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import { closeConnection, initTestModule } from '../helpers/hook';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { articleRequest } from '../helpers/request/article.request';
import { schemaRequest } from '../helpers/request/schema.request';

describe('Draft creation flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    initialArticle: ArticleResponse;
    createdArticle: ArticleResponse;
    createdDraft1: SchemaResponse;
    createdDraft2: SchemaResponse;
  };

  it('should create article with drafts', async () => {
    const articleDto = {
      name: 'drafts_test_article_ua_1',
      section: ['section1'],
      categoriesIds: [],
    };

    context.initialArticle = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    context.createdArticle = { ...context.initialArticle };

    const articleVersionCode = context.createdArticle.articleLanguage.version.code;

    context.createdDraft1 = await schemaRequest.createDraft(app, {
      languageCode: DefaultLanguages.UA,
      articleVersionCode,
      schemaDto: {
        section: ['section2'],
      },
    });

    context.createdDraft2 = await schemaRequest.createDraft(app, {
      languageCode: DefaultLanguages.UA,
      articleVersionCode,
      schemaDto: {
        section: ['section3'],
      },
    });
  });

  it('should update draft 1', async () => {
    const articleVersionCode = context.createdArticle.articleLanguage.version.code;
    const parentSchema = context.createdArticle.articleLanguage.version.schema;

    context.createdDraft1 = await schemaRequest.updateDraft(
      app,
      {
        code: context.createdDraft1.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDto: {
          section: ['section5'],
        },
      },
      {
        shouldBeRenovated: false,
        parentSchema: {
          section: parentSchema.section,
        },
      },
    );
  });

  it('fail to renovate valid draft schema', async () => {
    const schemaDto = { section: ['section3', 'section8'] };

    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    const expectedError = ErrorGenerator.alreadyActualSchema();

    const errorResponse = await schemaRequest.renovateDraftSchema(app, {
      code: context.createdDraft2.code,
      languageCode: DefaultLanguages.UA,
      articleVersionCode: articleVersion.code,
      schemaDto,
      responseStatus: expectedError.getStatus(),
    });

    expect(errorResponse).toEqual({
      message: expectedError.message,
      statusCode: expectedError.getStatus(),
    });
  });

  it('approve draft 1', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;
    const articleSchema = articleVersion.schema;

    await schemaRequest.approveDraft(
      app,
      {
        code: context.createdDraft1.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        version: articleVersion.version + 1,
        schemaDto: { section: context.createdDraft1.section.map(({ content }) => content) },
      },
    );

    const articleDrafts: ArticleDraftsResponse = await articleRequest.getArticleDrafts(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleCode: article.code,
      },
      {
        article: article,
        articleVersions: [
          {
            version: articleVersion.version,
            drafts: [context.createdDraft2],
            schemaDto: {
              section: articleSchema.section.map(({ content }) => ({ content })),
            },
          },
          {
            version: articleVersion.version + 1,
            drafts: [],
            schemaDto: {
              section: context.createdDraft1.section.map(({ content }) => ({ content })),
            },
          },
        ],
      },
    );

    context.createdDraft1 = await schemaRequest.getSchema(app, {
      code: context.createdDraft1.code,
      languageCode: DefaultLanguages.UA,
      articleVersionCode: articleDrafts.articleVersions[1].code,
    });
  });

  it('check renovation', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;
    const articleSchema = articleVersion.schema;

    await schemaRequest.getSchema(
      app,
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        shouldBeRenovated: true,
        schema: {
          section: context.createdDraft2.section,
        },
        parentSchema: {
          section: articleSchema.section,
        },
      },
    );
  });

  it('renovate schema', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    const schemaDto = { section: ['section3', 'section9'] };

    context.createdDraft2 = await schemaRequest.renovateDraftSchema(
      app,
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
        schemaDto,
      },
      {
        shouldBeRenovated: false,
        parentSchema: {
          section: context.createdDraft1.section.map(({ content }) => ({ content })),
        },
      },
    );

    context.createdArticle = await articleRequest.getArticle(app, {
      languageCode: DefaultLanguages.UA,
      code: context.createdArticle.code,
    });
  });

  it('approve draft 2', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    await schemaRequest.approveDraft(
      app,
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        version: articleVersion.version + 1,
        schemaDto: { section: context.createdDraft2.section.map(({ content }) => content) },
      },
    );
  });

  it('return article drafts', async () => {
    const article = context.createdArticle;
    const initialArticleSchema = context.initialArticle.articleLanguage.version.schema;

    await articleRequest.getArticleDrafts(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleCode: article.code,
      },
      {
        article: article,
        articleVersions: [
          {
            version: 1,
            drafts: [],
            schemaDto: {
              section: initialArticleSchema.section.map(({ content }) => ({ content })),
            },
          },
          {
            version: 2,
            drafts: [],
            schemaDto: {
              section: context.createdDraft1.section.map(({ content }) => ({ content })),
            },
          },
          {
            version: 3,
            drafts: [],
            schemaDto: {
              section: context.createdDraft2.section.map(({ content }) => ({ content })),
            },
          },
        ],
      },
    );
  });
});
