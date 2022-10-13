import { Injectable } from '@nestjs/common';
import { ArticleVersion } from '@prisma/client';

import { SchemaRepository } from '../../repositories/schema.repository';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorGenerator } from '../../utils/error.generator';
import { CreateSchemaDto } from './schema.dtos';
import { ArticleVersionAggregation } from '../article-version/articleVersion.types';
import { ContentDiffManager } from '../../services/contentDiffManager.service';
import {
  ActualArticleVersionAggregation,
  ApprovedArticleVersionResponse,
  SchemaResponse,
  SchemaWithSectionsAggregation,
} from './schema.types';
import { pick } from '../../utils/utils';

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
    const schema = await this.schemaRepository.findOneWithParent({
      ...options,
    });

    const updateGroups = ContentDiffManager.groupSectionsForUpdate(
      options.code,
      schema.sections,
      payload.sections,
    );

    const updatedSchema = await this.schemaRepository.updateWithRelations(updateGroups, {
      code: options.code,
    });

    const renovationCheckResult = await this.renovationCheck(
      updatedSchema,
      options.languageCode,
      options.articleVersionCode,
    );

    return this.mapToSchemaResponse(updatedSchema, {
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
      throw ErrorGenerator.alreadyActualSchema();
    }

    const updateGroups = ContentDiffManager.groupSectionsForUpdate(
      options.code,
      schema.sections,
      payload.sections,
    );

    const renovatedSchema = await this.schemaRepository.updateWithRelations(updateGroups, {
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

    const schema = await this.schemaRepository.create(payload, {
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
      throw ErrorGenerator.alreadyApprovedSchema();
    }

    const [, , newArticleVersion] = await this.prisma.$transaction([
      this.schemaRepository.update(
        {
          parentCode: null,
        },
        {
          code: options.code,
        },
      ),
      this.articleVersionRepository.update(
        {
          actual: null,
        },
        {
          code: parentArticleVersion.code,
        },
      ),
      this.articleVersionRepository.create({
        articleLanguageCode: parentArticleVersion.articleLanguageCode,
        schemaCode: schemaToApprove.code,
      }),
    ]);

    return this.mapToApprovedArticleVersionResponse(newArticleVersion);
  }

  private async renovationCheck(
    schema: {
      articleVersion: ArticleVersion | null;
      parentCode: string | null;
    },
    languageCode: string,
    articleVersionCode: string,
  ): Promise<{
    isRenovateNeeded: boolean;
    actualVersion?: ActualArticleVersionAggregation;
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

  private mapToApprovedArticleVersionResponse(
    articleVersion: ArticleVersionAggregation,
  ): ApprovedArticleVersionResponse {
    return {
      code: articleVersion.code,
      version: articleVersion.version,

      schema: {
        code: articleVersion.schema.code,
        sections: articleVersion.schema.sections.map((schemaOnSection) => ({
          ...pick(schemaOnSection.section, ['content', 'name']),
        })),
      },
    };
  }

  private mapToSchemaResponse(
    schema: SchemaWithSectionsAggregation,
    options: { shouldBeRenovated: boolean },
  ): SchemaResponse {
    return {
      code: schema.code,
      shouldBeRenovated: options.shouldBeRenovated,

      parentSchema: {
        sections:
          schema.parentSchema?.sections?.map((schemaOnSection) => ({
            ...pick(schemaOnSection.section, ['content', 'name']),
          })) || [],
      },

      sections: schema.sections.map((schemaOnSection) => ({
        ...pick(schemaOnSection.section, ['content', 'name']),
      })),
    };
  }
}
