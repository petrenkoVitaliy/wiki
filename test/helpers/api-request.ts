import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateArticleDto } from '../../src/modules/article/article.dtos';
import {
  MappedArticle,
  MappedSchema,
} from '../../src/modules/article/article.types';
import { CreateSchemaDto } from '../../src/modules/schema/schema.dtos';
import { SchemaResponse } from '../../src/modules/schema/schema.types';
import { prettyPrint } from '../../src/utils/utils';

export const getArticleRequest = async (
  app: INestApplication,
  options: { languageCode: string; code: string },
  testOptions?: {
    createdLanguages: string[];
    articleLanguageName: string;
  },
) => {
  const response = await request(app.getHttpServer())
    .get(`/${options.languageCode}/article/${options.code}`)
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
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

export const getSchemaRequest = async (
  app: INestApplication,
  options: { languageCode: string; code: string; articleVersionCode: string },
  testOptions?: {
    shouldBeRenovated: boolean;
    parentSchema: {
      headerContent?: string;
      bodyContent?: string;
    };
    schema: {
      headerContent?: string;
      bodyContent?: string;
    };
  },
) => {
  const response = await request(app.getHttpServer())
    .get(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema/${options.code}`,
    )
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: testOptions.shouldBeRenovated,
          parentSchema: {
            header: {
              content: testOptions.parentSchema.headerContent,
            },
            body: {
              content: testOptions.parentSchema.bodyContent,
            },
          },
          header: {
            content: testOptions.schema.headerContent,
          },
          body: {
            content: testOptions.schema.bodyContent,
          },
        });
      }
    });

  return response.body;
};

export const createArticleRequest = async (
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
          articleVersions: testOptions.articleVersions.map(
            (articleVersion) => ({
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
            }),
          ),
        });
      }
    });

  return response.body;
};

export const updateDraftRequest = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleVersionCode: string;
    schemaDTO: CreateSchemaDto;
  },
  testOptions?: {
    shouldBeRenovated: boolean;
    parentSchema: {
      headerContent?: string;
      bodyContent?: string;
    };
  },
) => {
  const response = await request(app.getHttpServer())
    .put(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema/${options.code}`,
    )
    .send({ ...options.schemaDTO })
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: testOptions.shouldBeRenovated,
          parentSchema: {
            header: {
              content: testOptions.parentSchema.headerContent,
            },
            body: {
              content: testOptions.parentSchema.bodyContent,
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

export const approveDraftRequest = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleVersionCode: string;
  },
  testOptions?: {
    version: number;
    schemaDTO: {
      body?: string;
      header?: string;
    };
  },
) => {
  const response = await request(app.getHttpServer())
    .post(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema/${options.code}/approve`,
    )
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          version: testOptions.version,
          schema: {
            header: {
              content: testOptions.schemaDTO.header,
            },
            body: {
              content: testOptions.schemaDTO.body,
            },
          },
        });
      }
    });

  return response.body;
};

export const renovateDraftSchemaRequest = async (
  app: INestApplication,
  options: {
    code: string;
    languageCode: string;
    articleVersionCode: string;
    schemaDto: CreateSchemaDto;
    responseStatus?: HttpStatus;
  },
  testOptions?: {
    shouldBeRenovated: boolean;
    parentSchema: {
      body?: string;
      header?: string;
    };
  },
) => {
  const response = await request(app.getHttpServer())
    .put(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema/${options.code}/renovate`,
    )
    .send(options.schemaDto)
    .expect(options.responseStatus || HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: testOptions.shouldBeRenovated,
          parentSchema: {
            header: {
              content: testOptions.parentSchema.header,
            },
            body: {
              content: testOptions.parentSchema.body,
            },
          },
          header: {
            content: options.schemaDto.header,
          },
          body: {
            content: options.schemaDto.body,
          },
        });
      }
    });

  return response.body;
};
