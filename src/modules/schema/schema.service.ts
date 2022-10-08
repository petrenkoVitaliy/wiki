import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { convertNullable } from '../../utils/utils';
import { SchemaRepository } from '../../repositories/schema.repository';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { PrismaService } from '../../prisma/prisma.service';
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
    private prisma: PrismaService,
  ) {}

  async getSchema(options: { code: string; articleVersionCode: string; languageCode: string }) {
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
    const [currentArticleVersion, actualArticleVersion] = await Promise.all([
      this.articleVersionRepository.findOne({
        code: options.articleVersionCode,
        languageCode: options.languageCode,
        enabled: true,
      }),

      this.articleVersionRepository.findActualSibling({
        code: options.articleVersionCode,
        languageCode: options.languageCode,
      }),
    ]);

    const schema = await this.schemaRepository.create({
      payload: payload,
      parentCode: currentArticleVersion.schemaCode,
    });

    const isLastVersion = currentArticleVersion.code === actualArticleVersion.code;

    return this.mapToSchemaResponse(schema, {
      shouldBeRenovated: !isLastVersion,
    });
  }

  async approveDraft(options: { articleVersionCode: string; languageCode: string; code: string }) {
    const [parentArticleVersion, schemaToApprove] = await Promise.all([
      this.articleVersionRepository.findOne({
        code: options.articleVersionCode,
        languageCode: options.languageCode,
        enabled: true,
      }),
      this.schemaRepository.findOne({
        code: options.code,
      }),
    ]);

    const isPrimarySchema = !schemaToApprove.parentSchema?.code;
    const isCorrectDraftRelation =
      schemaToApprove.parentSchema?.code === parentArticleVersion.schema.code;

    if (!isCorrectDraftRelation || isPrimarySchema) {
      throw new HttpException('Invalid schema to approve', HttpStatus.FORBIDDEN);
    }

    const [, , newArticleVersion] = await this.prisma.$transaction([
      this.schemaRepository.update({
        code: options.code,
        parentCode: null,
      }),
      this.articleVersionRepository.update(
        {
          code: parentArticleVersion.code,
        },
        {
          actual: null,
        },
      ),
      this.articleVersionRepository.create({
        articleLanguageCode: parentArticleVersion.articleLanguageCode,
        schemaCode: schemaToApprove.code,
      }),
    ]);

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

    const siblingArticleVersion = await this.articleVersionRepository.findActualSibling({
      code: articleVersionCode,
      languageCode,
    });

    const actualSchema = siblingArticleVersion.schema;

    return {
      isRenovateNeeded: actualSchema.code !== schema.parentCode,
      actualVersion: siblingArticleVersion,
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
