import { Injectable } from '@nestjs/common';
import { Schema, ArticleVersion } from '@prisma/client';
import { SchemaNested } from '../../../modules/schema/schema.types';

@Injectable()
export class SchemaFactory {
  private entitySeq = 0;

  basic(options: { parentSchema?: SchemaNested }) {
    const code = `schema_code_${++this.entitySeq}`;

    return {
      code,

      enabled: true,
      archived: false,

      parentCode: options.parentSchema?.code || null,
      ...(options.parentSchema ? { parentSchema: options.parentSchema } : null),

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    parentSchema?: Schema;
    childSchemas?: SchemaNested[];
    articleVersion?: ArticleVersion;
  }): SchemaNested & {
    parentSchema?: SchemaNested;
    childSchemas: SchemaNested[];
    articleVersion?: ArticleVersion;
  } {
    const basicEntity = this.basic({});

    return {
      ...basicEntity,

      parentCode: options.parentSchema?.code || null,
      parentSchema: options.parentSchema ? { ...options.parentSchema, sections: [] } : undefined,
      sections: [],
      childSchemas: options.childSchemas || [],
      articleVersion: options.articleVersion,
    };
  }
}
