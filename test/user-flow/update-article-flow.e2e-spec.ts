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
import { MappedArticle } from '../../src/modules/article/article.types';
import {
  createArticleRequest,
  deleteArticleRequest,
  getArticleRequest,
  patchArticleRequest,
} from '../helpers/api-request';

describe('User flow: update article', () => {
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
    createdArticleUA: MappedArticle;
    createdArticleEN: MappedArticle;
  };

  it('Should successfully create and update article', async () => {
    const articleDTO = {
      name: 'article_1',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await createArticleRequest(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    context.createdArticleUA = await patchArticleRequest(
      app,
      {
        code: context.createdArticleUA.code,
        languageCode: DefaultLanguages.UA,
        articleDTO: {
          enabled: false,
        },
      },
      {
        name: articleDTO.name,
        body: articleDTO.body,
        header: articleDTO.header,
      },
    );
  });

  it('Should successfully handle not existence errors', async () => {
    await patchArticleRequest(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.UA,
      articleDTO: {
        enabled: false,
      },
      responseStatus: HttpStatus.NOT_FOUND,
    });

    await getArticleRequest(app, {
      code: context.createdArticleUA.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });

  it('Should successfully create and delete article', async () => {
    const articleDTO = {
      name: 'article_2',
      body: 'body_2',
      header: 'header_2',
      categoriesIds: [],
    };

    context.createdArticleEN = await createArticleRequest(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
    });

    await getArticleRequest(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await deleteArticleRequest(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.EN,
      responseStatus: HttpStatus.NOT_FOUND,
    });

    await deleteArticleRequest(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await getArticleRequest(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });
});
