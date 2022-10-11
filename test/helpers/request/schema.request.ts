import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { MappedSchema } from '../../../src/modules/article/article.types';
import { CreateSchemaDto } from '../../../src/modules/schema/schema.dtos';
import { sortAny } from '../utils';

const getSchema = async (
  app: INestApplication,
  options: { languageCode: string; code: string; articleVersionCode: string },
  testOptions?: {
    shouldBeRenovated: boolean;
    parentSchema: {
      section: { content: string }[];
    };
    schema: {
      section: { content: string }[];
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
            section: testOptions.parentSchema.section,
          },
          section: testOptions.schema.section,
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
    schemaDto: CreateSchemaDto;
  },
  testOptions?: {
    basicSchema: MappedSchema;
  },
) => {
  const response = await request(app.getHttpServer())
    .post(`/${options.languageCode}/article-version/${options.articleVersionCode}/schema`)
    .send({ ...options.schemaDto })
    .expect(HttpStatus.CREATED)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: false,
          parentSchema: {
            section: testOptions.basicSchema.section,
          },
          section: options.schemaDto.section.map((content) => ({
            content,
          })),
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
    schemaDto: CreateSchemaDto;
  },
  testOptions?: {
    shouldBeRenovated: boolean;
    parentSchema: {
      section: { content: string }[];
    };
  },
) => {
  const response = await request(app.getHttpServer())
    .put(
      `/${options.languageCode}/article-version/${options.articleVersionCode}/schema/${options.code}`,
    )
    .send({ ...options.schemaDto })
    .expect(HttpStatus.OK)
    .expect(function (res) {
      if (testOptions) {
        expect(res.body).toMatchObject({
          shouldBeRenovated: testOptions.shouldBeRenovated,
          parentSchema: {
            section: testOptions.parentSchema.section,
          },
          section: options.schemaDto.section.map((content) => ({ content })),
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
    schemaDto: {
      section: string[];
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
            section: testOptions.schemaDto.section.map((content) => ({ content })),
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
      section: { content: string }[];
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
            // section: []
          },
          // section: [] sort TODO
        });

        const responseSections: { content: string }[] = res.body.section;

        expect(sortAny(responseSections.map(({ content }) => content))).toEqual(
          sortAny(options.schemaDto.section),
        );

        expect(sortAny(res.body.parentSchema.section)).toEqual(
          sortAny(testOptions.parentSchema.section),
        );
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
