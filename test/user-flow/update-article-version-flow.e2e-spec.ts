import { HttpStatus, INestApplication } from '@nestjs/common';

import { DefaultLanguages } from '../../src/constants/constants';
import { ArticleResponse } from '../../src/modules/article/article.types';
import { ArticleVersionResponse } from '../../src/modules/article-version/articleVersion.types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { closeConnection, initTestModule } from '../helpers/hook';

import { ArticleRequest } from '../helpers/request/article/article.request';
import { ArticleVersionRequest } from '../helpers/request/article-version/article-version.request';

describe('Update article version flow', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const Request = {} as {
    article: ArticleRequest;
    articleVersion: ArticleVersionRequest;
  };

  beforeAll(async () => {
    ({ app, prismaService } = await initTestModule());

    Request.article = new ArticleRequest(app);
    Request.articleVersion = new ArticleVersionRequest(app);
  });

  afterAll(async () => {
    await closeConnection(app, prismaService);
  });

  const context = {} as {
    createdArticleUA: ArticleResponse;
    articleVersionUA: ArticleVersionResponse;
  };

  it('create and update article version', async () => {
    const articleDto = {
      name: 'article_version_test_article_ua_1',
      sections: [
        {
          content: 'section1',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    context.articleVersionUA = await Request.articleVersion.getArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await Request.articleVersion.patchArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      articleVersionDto: {
        enabled: false,
      },
    });

    context.articleVersionUA = await Request.articleVersion.getArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });

  it('create and delete article version', async () => {
    const articleDto = {
      name: 'article_version_test_article_ua_2',
      sections: [
        {
          content: 'section2',
          name: 'name',
        },
      ],
      categoriesIds: [],
    };

    context.createdArticleUA = await Request.article.createArticle({
      languageCode: DefaultLanguages.UA,
      articleDto,
    });

    context.articleVersionUA = await Request.articleVersion.getArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await Request.articleVersion.deleteArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
    });

    context.articleVersionUA = await Request.articleVersion.getArticleVersion({
      code: context.createdArticleUA.articleLanguage.version.code,
      languageCode: DefaultLanguages.UA,
      responseStatus: HttpStatus.NOT_FOUND,
    });
  });
});
