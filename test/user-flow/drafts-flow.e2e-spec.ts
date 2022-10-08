import { HttpStatus, INestApplication } from '@nestjs/common';
import { DefaultLanguages } from '../../src/constants/constants';
import { MappedArticle, MappedArticleDrafts } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';

import { articleRequest } from '../helpers/request/article.request';
import { schemaRequest } from '../helpers/request/schema.request';
import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';

describe('User flow: draft creation', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  describe('Draft creation', () => {
    const context = {} as {
      initialArticle: MappedArticle;
      createdArticle: MappedArticle;
      createdDraft1: SchemaResponse;
      createdDraft2: SchemaResponse;
    };

    it('Should create article with drafts', async () => {
      const articleDTO = {
        name: 'drafts_test_article_ua_1',
        body: 'body_ua_1',
        header: 'header_ua_1',
        categoriesIds: [],
      };

      context.initialArticle = await articleRequest.createArticle(app, {
        languageCode: DefaultLanguages.UA,
        articleDTO,
      });

      context.createdArticle = { ...context.initialArticle };

      const articleVersionCode = context.createdArticle.articleLanguage.version.code;

      context.createdDraft1 = await schemaRequest.createDraft(app, {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO: {
          body: 'body_ua_2',
          header: 'header_ua_2',
        },
      });

      context.createdDraft2 = await schemaRequest.createDraft(app, {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO: {
          body: 'body_ua_3',
          header: 'header_ua_3',
        },
      });
    });

    it('Should update draft 1', async () => {
      const articleVersionCode = context.createdArticle.articleLanguage.version.code;
      const parentSchema = context.createdArticle.articleLanguage.version.schema;

      context.createdDraft1 = await schemaRequest.updateDraft(
        app,
        {
          code: context.createdDraft1.code,
          languageCode: DefaultLanguages.UA,
          articleVersionCode,
          schemaDTO: {
            body: 'body_ua_2_1',
            header: 'header_ua_2_1',
          },
        },
        {
          shouldBeRenovated: false,
          parentSchema: {
            bodyContent: parentSchema.body?.content,
            headerContent: parentSchema.header?.content,
          },
        },
      );
    });

    it('Should not renovate valid draft schema', async () => {
      const article = context.createdArticle;
      const articleVersion = article.articleLanguage.version;

      const errorResponse = await schemaRequest.renovateDraftSchema(app, {
        code: context.createdDraft2.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleVersion.code,
        schemaDto: { body: 'body_ua_3_1', header: 'header_ua_3_1' },
        responseStatus: HttpStatus.FORBIDDEN,
      });

      expect(errorResponse).toEqual({
        message: 'Schema is already actual',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('Should approve draft 1', async () => {
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
          schemaDTO: {
            body: context.createdDraft1.body?.content,
            header: context.createdDraft1.header?.content,
          },
        },
      );

      const articleDrafts: MappedArticleDrafts = await articleRequest.getArticleDrafts(
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
              schemaDTO: {
                body: articleSchema.body?.content,
                header: articleSchema.header?.content,
              },
            },
            {
              version: articleVersion.version + 1,
              drafts: [],
              schemaDTO: {
                body: context.createdDraft1.body?.content,
                header: context.createdDraft1.header?.content,
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

    it('Should check renovation', async () => {
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
            bodyContent: context.createdDraft2.body?.content,
            headerContent: context.createdDraft2.header?.content,
          },
          parentSchema: {
            bodyContent: articleSchema.body?.content,
            headerContent: articleSchema.header?.content,
          },
        },
      );
    });

    it('Should renovate schema', async () => {
      const article = context.createdArticle;
      const articleVersion = article.articleLanguage.version;

      context.createdDraft2 = await schemaRequest.renovateDraftSchema(
        app,
        {
          code: context.createdDraft2.code,
          languageCode: DefaultLanguages.UA,
          articleVersionCode: articleVersion.code,
          schemaDto: { body: 'body_ua_3_1', header: 'header_ua_3_1' },
        },
        {
          shouldBeRenovated: false,
          parentSchema: {
            body: context.createdDraft1.body?.content,
            header: context.createdDraft1.header?.content,
          },
        },
      );

      context.createdArticle = await articleRequest.getArticle(app, {
        languageCode: DefaultLanguages.UA,
        code: context.createdArticle.code,
      });
    });

    it('Should approve draft 2', async () => {
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
          schemaDTO: {
            body: context.createdDraft2.body?.content,
            header: context.createdDraft2.header?.content,
          },
        },
      );
    });

    it('Should return article drafts', async () => {
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
              schemaDTO: {
                body: initialArticleSchema.body?.content,
                header: initialArticleSchema.header?.content,
              },
            },
            {
              version: 2,
              drafts: [],
              schemaDTO: {
                body: context.createdDraft1.body?.content,
                header: context.createdDraft1.header?.content,
              },
            },
            {
              version: 3,
              drafts: [],
              schemaDTO: {
                body: context.createdDraft2.body?.content,
                header: context.createdDraft2.header?.content,
              },
            },
          ],
        },
      );
    });
  });
});
