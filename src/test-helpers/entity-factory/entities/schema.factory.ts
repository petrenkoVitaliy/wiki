import { Injectable } from '@nestjs/common';
import { Header, Schema, Body, ArticleVersion } from '@prisma/client';
import { BodyFactory } from './body.factory';
import { HeaderFactory } from './header.factory';

type SchemaWithContent = Schema & { body?: Body; header?: Header };

@Injectable()
export class SchemaFactory {
  private entitySeq = 0;

  constructor(private header: HeaderFactory, private body: BodyFactory) {}

  basic(options: { parentSchema?: Schema & { body?: Body; header?: Header } }) {
    const code = `schema_code_${++this.entitySeq}`;

    return {
      code,

      enabled: true,
      archived: false,

      parentCode: options.parentSchema?.code || null,
      ...(options.parentSchema ? { parentSchema: options.parentSchema } : null),

      bodyId: 1,
      headerId: 1,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    parentSchema?: Schema;
    childSchema?: (Schema & { body?: Body; header?: Header })[];
    articleVersion?: ArticleVersion;
  }): SchemaWithContent & {
    parentSchema?: SchemaWithContent;
    childSchema: SchemaWithContent[];
    articleVersion?: ArticleVersion;
  } {
    const body = this.body.basic();
    const header = this.header.basic();

    const code = `schema_code_${++this.entitySeq}`;

    return {
      code,

      enabled: true,
      archived: false,

      parentCode: options.parentSchema?.code || null,
      parentSchema: options.parentSchema,

      childSchema: options.childSchema || [],
      articleVersion: options.articleVersion,

      bodyId: body.id,
      body,

      headerId: header.id,
      header,

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }
}
