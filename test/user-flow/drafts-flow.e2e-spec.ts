import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { ArticleModule } from '../../src/modules/article/article.module';
import { CategoryModule } from '../../src/modules/category/category.module';
import { SchemaModule } from '../../src/modules/schema/schema.module';
import { ArticleVersionModule } from '../../src/modules/article-version/articleVersion.module';
import { AppController } from '../../src/modules/app/app.controller';
import { AppService } from '../../src/modules/app/app.service';
import { ROUTES } from '../../src/routes/routes';
import { DefaultLanguages } from '../../src/constants/constants';
import {
  MappedArticle,
  MappedArticleDrafts,
} from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import {
  approveDraftRequest,
  createArticleRequest,
  createDraftRequest,
  getArticleDraftsRequest,
  getArticleRequest,
  getSchemaRequest,
  renovateDraftSchemaRequest,
  updateDraftRequest,
} from '../helpers/api-request';

describe('User flow: draft creation', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ArticleModule,
        CategoryModule,
        SchemaModule,
        ArticleVersionModule,
        RouterModule.register(ROUTES),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
        name: 'article_ua_2',
        body: 'body_ua_1',
        header: 'header_ua_1',
        categoriesIds: [],
      };

      context.initialArticle = await createArticleRequest(app, {
        languageCode: DefaultLanguages.UA,
        articleDTO,
      });

      context.createdArticle = { ...context.initialArticle };

      const articleVersionCode =
        context.createdArticle.articleLanguage.version.code;

      context.createdDraft1 = await createDraftRequest(app, {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO: {
          body: 'body_ua_2',
          header: 'header_ua_2',
        },
      });

      context.createdDraft2 = await createDraftRequest(app, {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO: {
          body: 'body_ua_3',
          header: 'header_ua_3',
        },
      });
    });

    it('Should update draft 1', async () => {
      const articleVersionCode =
        context.createdArticle.articleLanguage.version.code;
      const parentSchema =
        context.createdArticle.articleLanguage.version.schema;

      context.createdDraft1 = await updateDraftRequest(
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

      const errorResponse = await renovateDraftSchemaRequest(app, {
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

      await approveDraftRequest(
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

      const articleDrafts: MappedArticleDrafts = await getArticleDraftsRequest(
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

      context.createdDraft1 = await getSchemaRequest(app, {
        code: context.createdDraft1.code,
        languageCode: DefaultLanguages.UA,
        articleVersionCode: articleDrafts.articleVersions[1].code,
      });
    });

    it('Should check renovation', async () => {
      const article = context.createdArticle;
      const articleVersion = article.articleLanguage.version;
      const articleSchema = articleVersion.schema;

      await getSchemaRequest(
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

      context.createdDraft2 = await renovateDraftSchemaRequest(
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

      context.createdArticle = await getArticleRequest(app, {
        languageCode: DefaultLanguages.UA,
        code: context.createdArticle.code,
      });
    });

    it('Should approve draft 2', async () => {
      const article = context.createdArticle;
      const articleVersion = article.articleLanguage.version;

      await approveDraftRequest(
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
      const initialArticleSchema =
        context.initialArticle.articleLanguage.version.schema;

      await getArticleDraftsRequest(
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
