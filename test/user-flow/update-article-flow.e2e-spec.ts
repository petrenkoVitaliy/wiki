import { HttpStatus, INestApplication } from '@nestjs/common';
import { DefaultLanguages } from '../../src/constants/constants';
import { MappedArticle } from '../../src/modules/article/article.types';

import { articleRequest } from '../helpers/request/article.request';
import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';

describe('User flow: update article', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA: MappedArticle;
    createdArticleEN: MappedArticle;
  };

  it('Should successfully create and update article', async () => {
    const articleDTO = {
      name: 'update_article_test_article_ua_1',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    context.createdArticleUA = await articleRequest.patchArticle(
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
    await articleRequest.patchArticle(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.UA,
      articleDTO: {
        enabled: false,
      },
      responseStatus: HttpStatus.NOT_FOUND,
    });

    await articleRequest.getArticle(app, {
      code: context.createdArticleUA.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });

  it('Should successfully create and delete article', async () => {
    const articleDTO = {
      name: 'update_article_test_article_en_2',
      body: 'body_2',
      header: 'header_2',
      categoriesIds: [],
    };

    context.createdArticleEN = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.EN,
      articleDTO,
    });

    await articleRequest.getArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await articleRequest.deleteArticle(app, {
      code: 'incorrect code',
      languageCode: DefaultLanguages.EN,
      responseStatus: HttpStatus.NOT_FOUND,
    });

    await articleRequest.deleteArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
    });

    await articleRequest.getArticle(app, {
      code: context.createdArticleEN.code,
      languageCode: DefaultLanguages.EN,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });
});
