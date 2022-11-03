import { Injectable } from '@nestjs/common';
import { Section } from '@prisma/client';
import { SchemasOnSectionsNested } from '../../../modules/schema/schema.types';

@Injectable()
export class SectionFactory {
  private entitySeq = 0;

  basic(options: { name?: string; content?: string }): Section {
    const code = `section_code_${++this.entitySeq}`;

    return {
      code,

      name: options.name || 'section_name',
      content: options.content || 'section_content',

      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  extended(options: {
    schemaCode?: string;
    order: number;
    name?: string;
    content?: string;
  }): SchemasOnSectionsNested {
    const basicEntity = this.basic({ name: options.name, content: options.content });

    return {
      section: basicEntity,
      sectionCode: basicEntity.code,
      schemaCode: options.schemaCode || 'schema_code',
      order: options.order,
    };
  }
}
