import { INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse, ArticleDraftsResponse } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import { closeConnection, initTestModule } from '../helpers/hook';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ErrorGenerator } from '../../src/utils/error.generator';

import { SchemaRequest } from '../helpers/request/schema/schema.request';
import { ArticleRequest } from '../helpers/request/article/article.request';

describe('Draft creation flow', () => {
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
    initialArticle: ArticleResponse;
    createdArticle: ArticleResponse;
    createdDraft1: SchemaResponse;
    createdDraft2: SchemaResponse;
  };

  it('should create article with drafts', async () => {
    const articleDto = {
      name: 'drafts_test_article_ua_1',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.initialArticle = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    context.createdArticle = { ...context.initialArticle };

    const articleVersionCode = context.createdArticle.articleLanguage.version.code;

    context.createdDraft1 = await Request.schema.createDraft({
      languageCode: DefaultLanguages.UA,
      articleVersionCode,
      schemaDto: {
        sections: [
          {
            content: 'section2',
            name: 'name',
          },
        ],
      },
    });

    context.createdDraft2 = await Request.schema.createDraft({
      languageCode: DefaultLanguages.UA,
      articleVersionCode,
      schemaDto: {
        sections: [
          {
            content: 'section3',
            name: 'name',
          },
        ],
      },
    });
  });

  it('should update draft 1', async () => {
    const articleVersionCode = context.createdArticle.articleLanguage.version.code;
    const parentSchema = context.createdArticle.articleLanguage.version.schema;

    const schemaDto = {
      sections: [
        {
          content: 'section5',
          name: 'name',
        },
      ],
    };

    context.createdDraft1 = await Request.schema.updateDraft(
      {
        code: context.createdDraft1.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDto,
      },
      {
        schemaDto,
        shouldBeRenovated: false,
        parentSchema: {
          sections: parentSchema.sections,
        },
      },
    );
  });

  it('fail to renovate valid draft schema', async () => {
    const schemaDto = {
      sections: [
        {
          content: 'section3',
          name: 'name',
        },
        {
          content: 'section8',
          name: 'name',
        },
      ],
    };

    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    const expectedError = ErrorGenerator.alreadyActualSchema();

    const errorResponse = await Request.schema.renovateDraftSchema({
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

    await Request.schema.approveDraft(
      {
        code: context.createdDraft1.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        version: articleVersion.version + 1,
        schemaDto: { sections: context.createdDraft1.sections },
      },
    );

    const articleDrafts: ArticleDraftsResponse = await Request.article.getArticleDrafts(
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
              sections: articleSchema.sections,
            },
          },
          {
            version: articleVersion.version + 1,
            drafts: [],
            schemaDto: {
              sections: context.createdDraft1.sections,
            },
          },
        ],
      },
    );

    context.createdDraft1 = await Request.schema.getSchema({
      code: context.createdDraft1.code,
      languageCode: DefaultLanguages.UA,
      articleVersionCode: articleDrafts.articleVersions[1].code,
    });
  });

  it('check renovation', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;
    const articleSchema = articleVersion.schema;

    await Request.schema.getSchema(
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        shouldBeRenovated: true,
        schema: {
          sections: context.createdDraft2.sections,
        },
        parentSchema: {
          sections: articleSchema.sections,
        },
      },
    );
  });

  it('renovate schema', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    const schemaDto = {
      sections: [
        {
          content: 'section3',
          name: 'name',
        },
        {
          content: 'section9',
          name: 'name',
        },
      ],
    };

    context.createdDraft2 = await Request.schema.renovateDraftSchema(
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
        schemaDto,
      },
      {
        schemaDto,
        shouldBeRenovated: false,
        parentSchema: {
          sections: context.createdDraft1.sections,
        },
      },
    );

    context.createdArticle = await Request.article.getArticle({
      languageCode: DefaultLanguages.UA,
      code: context.createdArticle.code,
    });
  });

  it('approve draft 2', async () => {
    const article = context.createdArticle;
    const articleVersion = article.articleLanguage.version;

    await Request.schema.approveDraft(
      {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
      },
      {
        version: articleVersion.version + 1,
        schemaDto: { sections: context.createdDraft2.sections },
      },
    );
  });

  it('return article drafts', async () => {
    const article = context.createdArticle;
    const initialArticleSchema = context.initialArticle.articleLanguage.version.schema;

    await Request.article.getArticleDrafts(
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
              sections: initialArticleSchema.sections,
            },
          },
          {
            version: 2,
            drafts: [],
            schemaDto: {
              sections: context.createdDraft1.sections,
            },
          },
          {
            version: 3,
            drafts: [],
            schemaDto: {
              sections: context.createdDraft2.sections,
            },
          },
        ],
      },
    );
  });
});
