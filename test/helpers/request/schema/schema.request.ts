import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { Argument } from '../../../../src/types/utilityTypes';
import { schemaValidations } from './schema.validation';
import { CreateSchemaDto } from '../../../../src/modules/schema/schema.dtos';

export class SchemaRequest {
  app: INestApplication;
  requestServer: request.SuperTest<request.Test>;

  constructor(app: INestApplication) {
    this.app = app;
    this.requestServer = request(this.app.getHttpServer());
  }

  async getSchema(
    options: { languageCode: string; code: string; articleVersionCode: string },
    testOptions?: Argument<typeof schemaValidations.getSchema, 1>,
  ) {
    const { languageCode, articleVersionCode, code } = options;

    const response = await this.requestServer
      .get(`/${languageCode}/article-version/${articleVersionCode}/schema/${code}`)
      .expect(HttpStatus.OK);

    if (testOptions) {
      schemaValidations.getSchema(response.body, testOptions);
    }

    return response.body;
  }

  async createDraft(
    options: { languageCode: string; articleVersionCode: string; schemaDto: CreateSchemaDto },
    testOptions?: Argument<typeof schemaValidations.createDraft, 1>,
  ) {
    const { languageCode, articleVersionCode } = options;

    const response = await this.requestServer
      .post(`/${languageCode}/article-version/${articleVersionCode}/schema`)
      .send({ ...options.schemaDto })
      .expect(HttpStatus.CREATED);

    if (testOptions) {
      schemaValidations.createDraft(response.body, testOptions);
    }

    return response.body;
  }

  async updateDraft(
    options: {
      code: string;
      languageCode: string;
      articleVersionCode: string;
      schemaDto: CreateSchemaDto;
    },
    testOptions?: Argument<typeof schemaValidations.updateDraft, 1>,
  ) {
    const { languageCode, articleVersionCode, code } = options;

    const response = await this.requestServer
      .put(`/${languageCode}/article-version/${articleVersionCode}/schema/${code}`)
      .send({ ...options.schemaDto })
      .expect(HttpStatus.OK);

    if (testOptions) {
      schemaValidations.updateDraft(response.body, testOptions);
    }

    return response.body;
  }

  async approveDraft(
    options: {
      code: string;
      languageCode: string;
      articleVersionCode: string;
    },
    testOptions?: Argument<typeof schemaValidations.approveDraft, 1>,
  ) {
    const { languageCode, articleVersionCode, code } = options;

    const response = await this.requestServer
      .post(`/${languageCode}/article-version/${articleVersionCode}/schema/${code}/approve`)
      .expect(HttpStatus.OK);

    if (testOptions) {
      schemaValidations.approveDraft(response.body, testOptions);
    }

    return response.body;
  }

  async renovateDraftSchema(
    options: {
      code: string;
      languageCode: string;
      articleVersionCode: string;
      schemaDto: CreateSchemaDto;
      responseStatus?: HttpStatus;
    },
    testOptions?: Argument<typeof schemaValidations.renovateDraftSchema, 1>,
  ) {
    const { languageCode, articleVersionCode, code } = options;

    const response = await this.requestServer
      .put(`/${languageCode}/article-version/${articleVersionCode}/schema/${code}/renovate`)
      .send(options.schemaDto)
      .expect(options.responseStatus || HttpStatus.OK);

    if (testOptions) {
      schemaValidations.renovateDraftSchema(response.body, testOptions);
    }

    return response.body;
  }
}
