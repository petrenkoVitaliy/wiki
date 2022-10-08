import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { MappedSchema } from '../../../src/modules/article/article.types';
import { CreateSchemaDto } from '../../../src/modules/schema/schema.dtos';

const getSchema = async (
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

const createDraft = async (
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
    .post(`/${options.languageCode}/article-version/${options.articleVersionCode}/schema`)
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

const updateDraft = async (
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

const approveDraft = async (
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

const renovateDraftSchema = async (
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

export const schemaRequest = {
  getSchema,
  createDraft,
  updateDraft,
  approveDraft,
  renovateDraftSchema,
};
