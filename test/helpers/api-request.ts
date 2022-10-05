import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateArticleDto } from '../../src/modules/article/article.dtos';
import {
  MappedArticle,
  MappedSchema,
} from '../../src/modules/article/article.types';
import { CreateSchemaDto } from '../../src/modules/schema/schema.dtos';
import { SchemaResponse } from '../../src/modules/schema/schema.types';

export const createArticleRequest = async (
  app: INestApplication,
  options: { languageCode: string; articleDTO: CreateArticleDto },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article`)
    .send({ ...options.articleDTO })
    .expect(HttpStatus.CREATED)
    .expect(function (res) {
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
    });

  return response.body;
};

export const addArticleLanguageRequest = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleVersionCode: string;
    articleDTO: CreateArticleDto;
  },
  testOptions?: {
    createdLanguages: string[];
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article/${options.articleVersionCode}`)
    .send({ ...options.articleDTO })
    .expect(HttpStatus.CREATED)
    .expect(function (res) {
      if (testOptions) {
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

export const createDraftRequest = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleVersionCode: string;
    schemaDTO: CreateSchemaDto;
  },
  testOptions?: {
    basicSchema: MappedSchema;
  },
) => {
  const response = await request(app.getHttpServer())
    .post(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema`,
    )
    .send({ ...options.schemaDTO })
    .expect(HttpStatus.CREATED)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: false,
          parentSchema: {
            header: {
              content: testOptions.basicSchema.header?.content,
            },
            body: {
              content: testOptions.basicSchema.body?.content,
            },
          },
          header: {
            content: options.schemaDTO.header,
          },
          body: {
            content: options.schemaDTO.body,
          },
        });
      }
    });

  return response.body;
};

export const getArticleDraftsRequest = async (
  app: INestApplication,
  options: {
    languageCode: string;
    articleCode: string;
  },
  testOptions?: {
    article: MappedArticle;
    draft1: SchemaResponse;
    draft2: SchemaResponse;
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
          articleVersions: [
            {
              version: 1,
              schema: {
                body: {
                  content:
                    testOptions.article.articleLanguage.version.schema.body
                      ?.content,
                },
                header: {
                  content:
                    testOptions.article.articleLanguage.version.schema.header
                      ?.content,
                },
              },
              drafts: [
                {
                  body: {
                    content: testOptions.draft1.body?.content,
                  },
                  header: {
                    content: testOptions.draft1.header?.content,
                  },
                },
                {
                  body: {
                    content: testOptions.draft2.body?.content,
                  },
                  header: {
                    content: testOptions.draft2.header?.content,
                  },
                },
              ],
            },
          ],
        });
      }
    });

  return response.body;
};
