import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { CreateArticleDto, PatchArticleDto } from '../../../../src/modules/article/article.dtos';
import { ArticleResponse } from '../../../../src/modules/article/article.types';
import { articleValidations } from './article.validation';
import { Argument } from '../../../../src/types/utilityTypes';

export class ArticleRequest {
  app: INestApplication;
  requestServer: request.SuperTest<request.Test>;

  constructor(app: INestApplication) {
    this.app = app;
    this.requestServer = request(this.app.getHttpServer());
  }

  async getArticle(
    options: { code: string; languageCode: string; responseStatus?: HttpStatus },
    testOptions?: Argument<typeof articleValidations.getArticle, 1>,
  ) {
    const response = await this.requestServer
      .get(`/${options.languageCode}/article/${options.code}`)
      .expect(options.responseStatus || HttpStatus.OK);

    if (testOptions) {
      articleValidations.getArticle(response.body, testOptions);
    }

    return response.body as ArticleResponse;
  }

  async createArticle(
    options: {
      languageCode: string;
      articleDto: CreateArticleDto;
      responseStatus?: HttpStatus;
    },
    testOptions?: Argument<typeof articleValidations.createArticle, 1>,
  ) {
    const response = await this.requestServer
      .post(`/${options.languageCode}/article`)
      .send({ ...options.articleDto })
      .expect(options.responseStatus || HttpStatus.CREATED);

    if (testOptions) {
      articleValidations.createArticle(response.body, testOptions);
    }

    return response.body;
  }

  async patchArticle(
    options: {
      code: string;
      languageCode: string;
      articleDto: PatchArticleDto;
      responseStatus?: HttpStatus;
    },
    testOptions?: Argument<typeof articleValidations.patchArticle, 1>,
  ) {
    const response = await this.requestServer
      .patch(`/${options.languageCode}/article/${options.code}`)
      .send({ ...options.articleDto })
      .expect(options.responseStatus || HttpStatus.OK);

    if (testOptions) {
      articleValidations.patchArticle(response.body, testOptions);
    }

    return response.body;
  }

  async deleteArticle(options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  }) {
    const response = await this.requestServer
      .delete(`/${options.languageCode}/article/${options.code}`)
      .expect(options.responseStatus || HttpStatus.OK)
      .expect(function (res) {
        if (!options.responseStatus) {
          expect(res.body.code).toBeTruthy();
        }
      });

    return response.body;
  }

  async getArticleDrafts(
    options: { languageCode: string; articleCode: string },
    testOptions?: Argument<typeof articleValidations.getArticleDrafts, 1>,
  ) {
    const response = await this.requestServer
      .get(`/${options.languageCode}/article/${options.articleCode}/draft`)
      .expect(HttpStatus.OK);

    if (testOptions) {
      articleValidations.getArticleDrafts(response.body, testOptions);
    }

    return response.body;
  }

  async addArticleLanguage(
    options: {
      languageCode: string;
      articleCode: string;
      articleDto: CreateArticleDto;
      responseStatus?: HttpStatus;
    },
    testOptions?: Argument<typeof articleValidations.addArticleLanguage, 1>,
  ) {
    const response = await this.requestServer
      .post(`/${options.languageCode}/article/${options.articleCode}`)
      .send({ ...options.articleDto })
      .expect(options.responseStatus || HttpStatus.CREATED);

    if (testOptions) {
      articleValidations.addArticleLanguage(response.body, testOptions);
    }

    return response.body;
  }
}
