import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PatchArticleLanguageDto } from '../../../../src/modules/article-language/articleLanguage.dtos';

export class ArticleLanguageRequest {
  app: INestApplication;
  requestServer: request.SuperTest<request.Test>;

  constructor(app: INestApplication) {
    this.app = app;
    this.requestServer = request(this.app.getHttpServer());
  }

  async patchArticleLanguage(options: {
    code: string;
    languageCode: string;
    articleCode: string;
    articleLanguageDto: PatchArticleLanguageDto;
    responseStatus?: HttpStatus;
  }) {
    const { languageCode, articleCode, code } = options;

    const response = await this.requestServer
      .patch(`/${languageCode}/article/${articleCode}/article-language/${code}`)
      .send(options.articleLanguageDto)
      .expect(options.responseStatus || HttpStatus.OK);

    return response.body;
  }

  async deleteArticleLanguage(options: {
    code: string;
    languageCode: string;
    articleCode: string;
    responseStatus?: HttpStatus;
  }) {
    const { languageCode, articleCode, code } = options;

    const response = await this.requestServer
      .delete(`/${languageCode}/article/${articleCode}/article-language/${code}`)
      .expect(options.responseStatus || HttpStatus.OK);

    return response.body;
  }
}
