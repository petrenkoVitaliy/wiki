import { Injectable } from '@nestjs/common';

import { CreateSchemaDto } from '../modules/schema/schema.dtos';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorGenerator } from '../utils/error.generator';

@Injectable()
export class SchemaRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { code: string }) {
    try {
      const result = await this.prisma.schema.findUniqueOrThrow({
        where: {
          code: options.code,
        },
        include: {
          parentSchema: true,
        },
      });

      return result;
    } catch (ex) {
      throw ErrorGenerator.notFound({ entityName: 'Schema' });
    }
  }

  async findOneWithParent(options: {
    code: string;
    articleVersionCode: string;
    languageCode: string;
  }) {
    try {
      const result = await this.prisma.schema.findFirstOrThrow({
        where: {
          code: options.code,
          OR: [
            {
              articleVersion: {
                code: options.articleVersionCode,

                articleLanguage: {
                  language: {
                    code: options.languageCode,
                  },
                },
              },
            },
            {
              parentSchema: {
                articleVersion: {
                  code: options.articleVersionCode,

                  articleLanguage: {
                    language: {
                      code: options.languageCode,
                    },
                  },
                },
              },
            },
          ],
        },

        include: {
          articleVersion: true,
          body: true,
          header: true,

          parentSchema: {
            include: {
              body: true,
              header: true,
            },
          },
        },
      });

      return result;
    } catch (ex) {
      throw ErrorGenerator.notFound({ entityName: 'Schema' });
    }
  }

  update(payload: { parentCode?: string | null }, options: { code: string }) {
    const { parentCode } = payload;

    return this.prisma.schema.update({
      where: {
        code: options.code,
      },
      data: { parentCode },
    });
  }

  updateWithRelations(payload: CreateSchemaDto, options: { code: string; parentCode?: string }) {
    const { parentCode } = options;

    return this.prisma.schema.update({
      where: {
        code: options.code,
      },

      data: {
        ...(parentCode
          ? {
              parentSchema: {
                connect: {
                  code: parentCode,
                },
              },
            }
          : null),

        body: {
          // TODO delete + create unique
          create: {
            content: payload.body,
          },
        },
        header: {
          create: {
            content: payload.header,
          },
        },
      },

      include: {
        articleVersion: true,
        body: true,
        header: true,

        parentSchema: {
          include: {
            body: true,
            header: true,
          },
        },
      },
    });
  }

  create(payload: CreateSchemaDto, options: { parentCode: string }) {
    return this.prisma.schema.create({
      data: {
        parentSchema: {
          connect: {
            code: options.parentCode,
          },
        },

        body: {
          create: {
            content: payload.body,
          },
        },
        header: {
          create: {
            content: payload.header,
          },
        },
      },

      include: {
        articleVersion: true,
        body: true,
        header: true,

        parentSchema: {
          include: {
            body: true,
            header: true,
          },
        },
      },
    });
  }
}
