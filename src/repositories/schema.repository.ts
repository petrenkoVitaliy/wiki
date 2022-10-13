import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateSchemaDto } from '../modules/schema/schema.dtos';
import { ContentUpdateGroups } from '../modules/schema/schema.types';
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
          // TODO unnecessary
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
          sections: {
            include: {
              section: true,
            },
            orderBy: {
              order: Prisma.SortOrder.asc,
            },
          },

          parentSchema: {
            include: {
              sections: {
                include: {
                  section: true,
                },
                orderBy: {
                  order: Prisma.SortOrder.asc,
                },
              },
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

  updateWithRelations(
    updateGroups: ContentUpdateGroups,
    options: { code: string; parentCode?: string },
  ) {
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

        sections: {
          create: updateGroups.toCreate.map(({ content, order, name }) => ({
            order,
            section: {
              create: {
                content,
                name,
              },
            },
          })),

          deleteMany: updateGroups.toDelete.map(({ code }) => ({
            sectionCode: code,
          })),

          update: updateGroups.toUpdate.map(({ code, order }) => ({
            where: {
              schemaCode_sectionCode: {
                schemaCode: options.code,
                sectionCode: code,
              },
            },
            data: {
              order,
            },
          })),
        },
      },

      include: {
        articleVersion: true,
        sections: {
          include: {
            section: true,
          },
          orderBy: {
            order: Prisma.SortOrder.asc,
          },
        },

        parentSchema: {
          include: {
            sections: {
              include: {
                section: true,
              },
              orderBy: {
                order: Prisma.SortOrder.asc,
              },
            },
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

        sections: {
          create: payload.sections.map(({ content, name }, order) => ({
            order,
            section: {
              create: {
                content,
                name,
              },
            },
          })),
        },
      },

      include: {
        articleVersion: true,
        sections: {
          include: {
            section: true,
          },
          orderBy: {
            order: Prisma.SortOrder.asc,
          },
        },

        parentSchema: {
          include: {
            sections: {
              include: {
                section: true,
              },
              orderBy: {
                order: Prisma.SortOrder.asc,
              },
            },
          },
        },
      },
    });
  }
}
