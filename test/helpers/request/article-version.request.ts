import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PatchArticleVersionDto } from '../../../src/modules/article-version/articleVersion.dtos';

const getArticleVersion = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .get(`/${options.languageCode}/article-version/${options.code}`)
    .expect(options.responseStatus || HttpStatus.OK);

  return response.body;
};

const patchArticleVersion = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleVersionDTO: PatchArticleVersionDto;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .patch(`/${options.languageCode}/article-version/${options.code}`)
    .send({ ...options.articleVersionDTO })
    .expect(options.responseStatus || HttpStatus.OK);

  return response.body;
};

const deleteArticleVersion = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .delete(`/${options.languageCode}/article-version/${options.code}`)
    .expect(options.responseStatus || HttpStatus.OK);

  return response.body;
};

export const articleVersionRequest = {
  getArticleVersion,
  patchArticleVersion,
  deleteArticleVersion,
};
