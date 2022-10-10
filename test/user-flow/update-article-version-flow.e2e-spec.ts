import { HttpStatus, INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { ArticleVersionResponse } from '../../src/modules/article-version/articleVersion.types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';

import { articleRequest } from '../helpers/request/article.request';
import { articleVersionRequest } from '../helpers/request/article-version.request';

describe('Update article version flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA: ArticleResponse;
    articleVersionUA: ArticleVersionResponse;
  };

  it('create and update article version', async () => {
    const articleDTO = {
      name: 'article_version_test_article_ua_1',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    context.articleVersionUA = await articleVersionRequest.getArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await articleVersionRequest.patchArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      articleVersionDTO: {
        enabled: false,
      },
    });

    context.articleVersionUA = await articleVersionRequest.getArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });

  it('create and delete article version', async () => {
    const articleDTO = {
      name: 'article_version_test_article_ua_2',
      body: 'body_1',
      header: 'header_1',
      categoriesIds: [],
    };

    context.createdArticleUA = await articleRequest.createArticle(app, {
      languageCode: DefaultLanguages.UA,
      articleDTO,
    });

    context.articleVersionUA = await articleVersionRequest.getArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await articleVersionRequest.deleteArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await articleVersionRequest.getArticleVersion(app, {
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });
});
