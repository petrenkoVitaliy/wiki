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
import { MappedArticle, MappedArticleDrafts } from '../../src/modules/article/article.types';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import {
  addArticleLanguageRequest,
  createArticleRequest,
  createDraftRequest,
  getArticleDraftsRequest,
  getArticleRequest,
} from '../helpers/api-request';

describe('User flow: article creation', () => {
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

  const context = {} as {
    createdArticleEN: MappedArticle;
    createdArticleUA: MappedArticle;
    createdDraft1: SchemaResponse;
    createdDraft2: SchemaResponse;
    articleDrafts1: MappedArticleDrafts;
  };

  it('Should successfully create new article', async () => {
    const articleDTO = {
      name: 'article_en_1',
      body: 'body_en_1',
      header: 'header_en_1',
      categoriesIds: [],
    };

    context.createdArticleEN = await createArticleRequest(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
    });
  });

  it('Should fail to create new article with same name', async () => {
    const articleDTO = {
      name: 'article_en_1',
      body: 'body_en_1',
      header: 'header_en_1',
      categoriesIds: [],
    };

    const errorResponse = await createArticleRequest(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
      responseStatus: HttpStatus.CONFLICT,
    });

    expect(errorResponse).toEqual({
      message: 'Article name must be unique',
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('Should successfully add new language to article', async () => {
    const articleDTO = {
      name: 'article_ua_1',
      body: 'body_ua_1',
      header: 'header_ua_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await addArticleLanguageRequest(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleDTO,
        articleVersionCode: context.createdArticleEN.code,
      },
      { createdLanguages: [DefaultLanguages.EN] },
    );
  });

  it('Should successfully create new draft 1', async () => {
    const schemaDTO = {
      body: 'body_ua_2',
      header: 'header_ua_2',
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;

    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft1 = await createDraftRequest(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO,
      },
      { basicSchema },
    );
  });

  it('Should successfully create new draft 2', async () => {
    const schemaDTO = {
      body: 'body_ua_3',
      header: 'header_ua_3',
    };

    const basicSchema = context.createdArticleUA.articleLanguage.version.schema;
    const articleVersionCode = context.createdArticleUA.articleLanguage.version.code;

    context.createdDraft2 = await createDraftRequest(
      app,
      {
        languageCode: DefaultLanguages.UA,
        articleVersionCode,
        schemaDTO,
      },
      { basicSchema },
    );
  });

  it('Should successfully get article drafts', async () => {
    context.articleDrafts1 = await getArticleDraftsRequest(
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

  it('Should successfully get article', async () => {
    await getArticleRequest(
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
