import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { CreateArticleDto, PatchArticleDto } from '../../../src/modules/article/article.dtos';
import { ArticleResponse } from '../../../src/modules/article/article.types';
import { SchemaResponse } from '../../../src/modules/schema/schema.types';

const getArticle = async (
  app: INestApplication,
  options: {
    languageCode: string;
    code: string;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    createdLanguages: string[];
    articleLanguageName: string;
  },
) => {
  const response = await request(app.getHttpServer())
    .get(`/${options.languageCode}/article/${options.code}`)
    .expect(options.responseStatus || HttpStatus.OK)
    .expect(function (res) {
      if (!options.responseStatus && testOptions) {
        expect(res.body).toMatchObject({
          code: options.code,
          type: 'common',
          languages: testOptions.createdLanguages,
          articleLanguage: {
            name: testOptions.articleLanguageName,
            version: {
              schema: {
                body: {},
                header: {},
              },
            },
          },
        });
      }
    });

  return response.body;
};

const createArticle = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleDTO: CreateArticleDto;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article`)
    .send({ ...options.articleDTO })
    .expect(options.responseStatus || HttpStatus.CREATED)
    .expect(function (res) {
      if (!options.responseStatus) {
        expect(res.body).toMatchObject({
          type: 'common',
          languages: [],
          articleLanguage: {
            name: options.articleDTO.name,
            version: {
              version: 1,
              schema: {
                body: {
                  content: options.articleDTO.body,
                },
                header: {
                  content: options.articleDTO.header,
                },
              },
            },
          },
        });
      }
    });

  return response.body;
};

const patchArticle = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleDTO: PatchArticleDto;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    name: string;
    body: string;
    header: string;
  },
) => {
  const response = await request(app.getHttpServer())
    .patch(`/${options.languageCode}/article/${options.code}`)
    .send({ ...options.articleDTO })
    .expect(options.responseStatus || HttpStatus.OK)
    .expect(function (res) {
      if (!options.responseStatus && testOptions) {
        expect(res.body).toMatchObject({
          type: 'common',
          languages: [],
          articleLanguage: {
            name: testOptions.name,
            version: {
              version: 1,
              schema: {
                body: {
                  content: testOptions.body,
                },
                header: {
                  content: testOptions.header,
                },
              },
            },
          },
        });
      }
    });

  return response.body;
};

const deleteArticle = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .delete(`/${options.languageCode}/article/${options.code}`)
    .expect(options.responseStatus || HttpStatus.OK)
    .expect(function (res) {
      if (!options.responseStatus) {
        expect(res.body.code).toBeTruthy();
      }
    });

  return response.body;
};

const getArticleDrafts = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleCode: string;
  },
  testOptions?: {
    article: ArticleResponse;
    articleVersions: {
      version: number;
      schemaDTO: {
        body?: string;
        header?: string;
      };
      drafts: SchemaResponse[];
    }[];
  },
) => {
  const response = await request(app.getHttpServer())
    .get(`/${options.languageCode}/article/${options.articleCode}/draft`)
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          articleLanguage: {
            name: testOptions.article.articleLanguage.name,
          },
          articleVersions: testOptions.articleVersions.map((articleVersion) => ({
            version: articleVersion.version,
            schema: {
              body: {
                content: articleVersion.schemaDTO.body,
              },
              header: {
                content: articleVersion.schemaDTO.header,
              },
            },
            drafts: articleVersion.drafts.map((draft) => ({
              body: {
                content: draft.body?.content,
              },
              header: {
                content: draft.header?.content,
              },
            })),
          })),
        });
      }
    });

  return response.body;
};

const addArticleLanguage = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleCode: string;
    articleDTO: CreateArticleDto;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    createdLanguages: string[];
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article/${options.articleCode}`)
    .send({ ...options.articleDTO })
    .expect(options.responseStatus || HttpStatus.CREATED)
    .expect(function (res) {
      if (!options.responseStatus && testOptions) {
        expect(res.body).toMatchObject({
          type: 'common',
          languages: testOptions.createdLanguages,
          articleLanguage: {
            name: options.articleDTO.name,
            version: {
              version: 1,
              schema: {
                body: {
                  content: options.articleDTO.body,
                },
                header: {
                  content: options.articleDTO.header,
                },
              },
            },
          },
        });
      }
    });

  return response.body;
};

export const articleRequest = {
  getArticle,
  getArticleDrafts,
  deleteArticle,
  patchArticle,
  createArticle,
  addArticleLanguage,
};
