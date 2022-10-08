import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PatchArticleLanguageDto } from '../../../src/modules/article-language/articleLanguage.dtos';

const patchArticleLanguage = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleCode: string;
    articleLanguageDto: PatchArticleLanguageDto;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .patch(
      `/${options.languageCode}/article/${options.articleCode}/article-language/${options.code}`,
    )
    .send(options.articleLanguageDto)
    .expect(options.responseStatus || HttpStatus.OK);

  return response.body;
};

const deleteArticleLanguage = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleCode: string;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .delete(
      `/${options.languageCode}/article/${options.articleCode}/article-language/${options.code}`,
    )
    .expect(options.responseStatus || HttpStatus.OK);

  return response.body;
};

export const articleLanguageRequest = {
  deleteArticleLanguage,
  patchArticleLanguage,
};
