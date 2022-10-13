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
    articleResponse: ArticleResponse;
    createdLanguages: string[];
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
            name: testOptions.articleResponse.articleLanguage.name,
            version: {
              schema: {
                sections: testOptions.articleResponse.articleLanguage.version.schema.sections,
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
    articleDto: CreateArticleDto;
    responseStatus?: HttpStatus;
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article`)
    .send({ ...options.articleDto })
    .expect(options.responseStatus || HttpStatus.CREATED)
    .expect(function (res) {
      if (!options.responseStatus) {
        expect(res.body).toMatchObject({
          type: 'common',
          languages: [],
          articleLanguage: {
            name: options.articleDto.name,
            version: {
              version: 1,
              schema: {
                sections: options.articleDto.sections,
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
    articleDto: PatchArticleDto;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    name: string;
    sections: { name: string; content: string }[];
  },
) => {
  const response = await request(app.getHttpServer())
    .patch(`/${options.languageCode}/article/${options.code}`)
    .send({ ...options.articleDto })
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
                sections: testOptions.sections,
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
      schemaDto: {
        sections: { content: string; name: string }[];
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
              sections: articleVersion.schemaDto.sections,
            },
            drafts: articleVersion.drafts.map((draft) => ({
              sections: draft.sections,
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
    articleDto: CreateArticleDto;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    createdLanguages: string[];
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article/${options.articleCode}`)
    .send({ ...options.articleDto })
    .expect(options.responseStatus || HttpStatus.CREATED)
    .expect(function (res) {
      if (!options.responseStatus && testOptions) {
        expect(res.body).toMatchObject({
          type: 'common',
          languages: testOptions.createdLanguages,
          articleLanguage: {
            name: options.articleDto.name,
            version: {
              version: 1,
              schema: {
                sections: options.articleDto.sections,
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
