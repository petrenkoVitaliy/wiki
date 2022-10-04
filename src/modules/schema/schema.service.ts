import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { convertNullable } from '../../utils/utils';
import { SchemaRepository } from '../../repositories/schema.repository';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { CreateSchemaDto } from './schema.dtos';
import {
  ArticleVersionAggregation,
  ArticleVersionAggregationExtended,
  NewArticleVersionResponse,
  SchemaAggregation,
  SchemaResponse,
} from './schema.types';

@Injectable()
export class SchemaService {
  constructor(
    private articleVersionRepository: ArticleVersionRepository,
    private schemaRepository: SchemaRepository,
  ) {}

  async getSchema(options: {
    code: string;
    articleVersionCode: string;
    languageCode: string;
  }) {
    const schema = await this.schemaRepository.findOneWithParent(options);

    const renovationCheckResult = await this.renovationCheck(
      schema,
      options.languageCode,
      options.articleVersionCode,
    );

    return this.mapToSchemaResponse(schema, {
      shouldBeRenovated: renovationCheckResult.isRenovateNeeded,
    });
  }

  async updateDraftSchema(
    payload: CreateSchemaDto,
    options: { code: string; languageCode: string; articleVersionCode: string },
  ) {
    const schema = await this.schemaRepository.updateWithRelations({
      payload: payload,
      code: options.code,
    });

    const renovationCheckResult = await this.renovationCheck(
      schema,
      options.languageCode,
      options.articleVersionCode,
    );

    return this.mapToSchemaResponse(schema, {
      shouldBeRenovated: renovationCheckResult.isRenovateNeeded,
    });
  }

  async renovateDraftSchema(
    payload: CreateSchemaDto,
    options: { code: string; languageCode: string; articleVersionCode: string },
  ) {
    const schema = await this.schemaRepository.findOneWithParent(options);

    const renovationCheckResult = await this.renovationCheck(
      schema,
      options.languageCode,
      options.articleVersionCode,
    );

    if (!renovationCheckResult.isRenovateNeeded) {
      throw new HttpException('Schema is already actual', HttpStatus.FORBIDDEN);
    }

    const renovatedSchema = await this.schemaRepository.updateWithRelations({
      payload: payload,
      code: options.code,
      parentCode: renovationCheckResult.actualVersion?.schema?.code,
    });

    return this.mapToSchemaResponse(renovatedSchema, {
      shouldBeRenovated: false,
    });
  }

  async createDraftSchema(
    payload: CreateSchemaDto,
    options: { articleVersionCode: string; languageCode: string },
  ) {
    const articleVersion =
      await this.articleVersionRepository.findOneWithSiblings({
        code: options.articleVersionCode,
        languageCode: options.languageCode,
      });

    const schema = await this.schemaRepository.create({
      payload: payload,
      parentCode: articleVersion.schemaCode,
    });

    const actualVersion = articleVersion.articleLanguage.articleVersion[0];
    const isLastVersion = articleVersion.code === actualVersion?.code;

    return this.mapToSchemaResponse(schema, {
      shouldBeRenovated: isLastVersion,
    });
  }

  async approveDraft(options: {
    articleVersionCode: string;
    languageCode: string;
    code: string;
  }) {
    const currentArticleVersion = await this.articleVersionRepository.findOne({
      code: options.articleVersionCode,
      languageCode: options.languageCode,
    });

    const schemaToApprove = await this.schemaRepository.findOne({
      code: options.code,
    });

    if (!schemaToApprove.parentSchema) {
      throw new HttpException(
        'Invalid schema to approve',
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      schemaToApprove.parentSchema.code !== currentArticleVersion.schema.code
    ) {
      throw new HttpException(
        'Invalid schema to approve',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.schemaRepository.update({
      code: options.code,
      parentCode: null,
    });

    const newArticleVersion = await this.articleVersionRepository.create({
      articleLanguageCode: currentArticleVersion.articleLanguageCode,
      schemaCode: schemaToApprove.code,
    });

    return this.mapToNewArticleVersionResponse(newArticleVersion);
  }

  private async renovationCheck(
    schema: SchemaAggregation,
    languageCode: string,
    articleVersionCode: string,
  ): Promise<{
    isRenovateNeeded: boolean;
    actualVersion?: ArticleVersionAggregation;
  }> {
    if (schema.articleVersion || !schema.parentCode) {
      return { isRenovateNeeded: false };
    }

    const articleVersionWithSiblings =
      await this.articleVersionRepository.findOneWithSiblings({
        code: articleVersionCode,
        languageCode,
      });

    const actualVersion =
      articleVersionWithSiblings.articleLanguage.articleVersion[0];

    const actualSchema = actualVersion.schema;

    return {
      isRenovateNeeded: actualSchema.code !== schema.parentCode,
      actualVersion,
    };
  }

  private mapToNewArticleVersionResponse(
    articleVersion: ArticleVersionAggregationExtended,
  ): NewArticleVersionResponse {
    return {
      code: articleVersion.code,
      version: articleVersion.version,

      schema: {
        code: articleVersion.schema.code,
        ...convertNullable(articleVersion.schema.header, (header) => ({
          header: { content: header.content },
        })),
        ...convertNullable(articleVersion.schema.body, (body) => ({
          body: { content: body.content },
        })),
      },
    };
  }

  private mapToSchemaResponse(
    schema: SchemaAggregation,
    options: { shouldBeRenovated: boolean },
  ): SchemaResponse {
    return {
      code: schema.code,
      shouldBeRenovated: options.shouldBeRenovated,

      parentSchema: {
        ...convertNullable(schema.parentSchema?.header, (header) => ({
          header: { content: header.content },
        })),
        ...convertNullable(schema.parentSchema?.body, (body) => ({
          body: { content: body.content },
        })),
      },

      ...convertNullable(schema.header, (header) => ({
        header: { content: header.content },
      })),
      ...convertNullable(schema.body, (body) => ({
        body: { content: body.content },
      })),
    };
  }
}
