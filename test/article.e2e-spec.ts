import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { ArticleModule } from '../src/modules/article/article.module';
import { CategoryModule } from '../src/modules/category/category.module';
import { SchemaModule } from '../src/modules/schema/schema.module';
import { ArticleVersionModule } from '../src/modules/article-version/articleVersion.module';
import { AppController } from '../src/modules/app/app.controller';
import { AppService } from '../src/modules/app/app.service';
import { ROUTES } from '../src/routes/routes';
import { DefaultLanguages } from '../src/constants/constants';
import { prettyPrint } from '../src/utils/utils';
import { Article } from '@prisma/client';

describe('Article', () => {
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
    let article: Article;

    it('Should successfully create new article', async () => {
      const articleDTO = {
        name: 'article_ua_1',
        body: 'body',
        header: 'header',
        categoriesIds: [],
      };

      const createdArticleResponse = await request(app.getHttpServer())
        .post(`/${DefaultLanguages.UA}/article`)
        .send({ ...articleDTO })
        .expect(HttpStatus.CREATED)
        .expect(function (res) {
          prettyPrint(res.body);
          expect(res.body.code).toBeTruthy();
          expect(res.body).toMatchObject({
            type: 'common',
            languages: [],
            articleLanguage: {
              name: articleDTO.name,
              version: {
                version: 1,
                schema: {
                  body: {
                    content: articleDTO.body,
                  },
                  header: {
                    content: articleDTO.header,
                  },
                },
              },
            },
          });
        });

      article = createdArticleResponse.body;
    });

    it('Should successfully add new language to article', async () => {
      const articleDTO = {
        name: 'article_en_1',
        body: 'body',
        header: 'header',
        categoriesIds: [],
      };

      const createdArticleResponse = await request(app.getHttpServer())
        .post(`/${DefaultLanguages.EN}/article/${article.code}`)
        .send({ ...articleDTO })
        .expect(HttpStatus.CREATED)
        .expect(function (res) {
          prettyPrint(res.body);
          expect(res.body.code).toBeTruthy();
          // expect(res.body).toMatchObject({
          //   type: 'common',
          //   languages: [],
          //   articleLanguage: {
          //     name: articleDTO.name,
          //     version: {
          //       version: 1,
          //       schema: {
          //         body: {
          //           content: articleDTO.body,
          //         },
          //         header: {
          //           content: articleDTO.header,
          //         },
          //       },
          //     },
          //   },
          // });
        });

      console.log(createdArticleResponse.body);
    });
  });
});
