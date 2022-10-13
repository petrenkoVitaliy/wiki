import { Injectable } from '@nestjs/common';
import { ArticleLanguage, ArticleVersion } from '@prisma/client';
import { SchemaNested } from '../../../modules/schema/schema.types';

@Injectable()
export class ArticleVersionFactory {
  private entitySeq = 0;

  basic(options: {
    version?: number;
    schemaCode?: string;
    articleLanguageCode?: string;
    actual?: boolean;
    archived?: boolean;
    enabled?: boolean;
  }): ArticleVersion {
    return {
      code: `article_version_code_${++this.entitySeq}`,
      enabled: options.enabled !== undefined ? options.enabled : true,
      archived: options.archived !== undefined ? options.archived : false,
      version: options.version || 1,
      actual: options.actual || null,

      schemaCode: options.schemaCode || '',
      articleLanguageCode: options.articleLanguageCode || '',

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    schema?: SchemaNested;
    articleLanguage?: ArticleLanguage;
    version?: number;
    actual?: boolean;
    archived?: boolean;
    enabled?: boolean;
  }): ArticleVersion & {
    schema?: SchemaNested;
    articleLanguage?: ArticleLanguage;
  } {
    const basicEntity = this.basic({
      schemaCode: options.schema?.code,
      articleLanguageCode: options.articleLanguage?.code,
      actual: options.actual,
      enabled: options.enabled,
      archived: options.archived,
    });

    return {
      ...basicEntity,

      schema: options.schema,
      articleLanguage: options.articleLanguage,
    };
  }
}
