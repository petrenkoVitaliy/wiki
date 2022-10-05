import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
  addArticleLanguageRequest,
  createArticleRequest,
  createDraftRequest,
  getArticleDraftsRequest,
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

  describe('Article Creation', () => {
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

      const basicSchema =
        context.createdArticleUA.articleLanguage.version.schema;

      const articleVersionCode =
        context.createdArticleUA.articleLanguage.version.code;

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

      const basicSchema =
        context.createdArticleUA.articleLanguage.version.schema;
      const articleVersionCode =
        context.createdArticleUA.articleLanguage.version.code;

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
          draft1: context.createdDraft1,
          draft2: context.createdDraft2,
        },
      );
    });
  });
});
