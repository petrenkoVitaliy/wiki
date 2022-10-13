import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PatchArticleVersionDto } from '../../../../src/modules/article-version/articleVersion.dtos';

export class ArticleVersionRequest {
  app: INestApplication;
  requestServer: request.SuperTest<request.Test>;

  constructor(app: INestApplication) {
    this.app = app;
    this.requestServer = request(this.app.getHttpServer());
  }

  async getArticleVersion(options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  }) {
    const { languageCode, code } = options;

    const response = await this.requestServer
      .get(`/${languageCode}/article-version/${code}`)
      .expect(options.responseStatus || HttpStatus.OK);

    return response.body;
  }

  async patchArticleVersion(options: {
    code: string;
    languageCode: string;
    articleVersionDto: PatchArticleVersionDto;
    responseStatus?: HttpStatus;
  }) {
    const { languageCode, code } = options;

    const response = await this.requestServer
      .patch(`/${languageCode}/article-version/${code}`)
      .send({ ...options.articleVersionDto })
      .expect(options.responseStatus || HttpStatus.OK);

    return response.body;
  }

  async deleteArticleVersion(options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  }) {
    const { languageCode, code } = options;

    const response = await this.requestServer
      .delete(`/${languageCode}/article-version/${code}`)
      .expect(options.responseStatus || HttpStatus.OK);

    return response.body;
  }
}
