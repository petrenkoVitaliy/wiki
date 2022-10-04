import { Injectable } from '@nestjs/common';
import {
  ArticleLanguage,
  ArticleVersion,
  Header,
  Schema,
  Body,
} from '@prisma/client';

@Injectable()
export class ArticleVersionFactory {
  private entitySeq = 0;

  basic(options: {
    version?: number;
    schemaCode?: string;
    articleLanguageCode?: string;
  }): ArticleVersion {
    return {
      code: `article_version_code_${++this.entitySeq}`,
      enabled: true,
      version: options.version || 1,

      schemaCode: options.schemaCode || '',
      articleLanguageCode: options.articleLanguageCode || '',

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    schema?: Schema & { body?: Body; header?: Header };
    articleLanguage?: ArticleLanguage;
    version?: number;
  }): ArticleVersion & {
    schema?: Schema & { body?: Body; header?: Header };
    articleLanguage?: ArticleLanguage;
  } {
    const basicEntity = this.basic({
      schemaCode: options.schema?.code,
      articleLanguageCode: options.articleLanguage?.code,
    });

    return {
      ...basicEntity,

      schema: options.schema,
      articleLanguage: options.articleLanguage,
    };
  }
}
