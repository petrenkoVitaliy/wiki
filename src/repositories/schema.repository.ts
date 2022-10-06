import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateSchemaDto } from '../modules/schema/schema.dtos';
import { PrismaService } from '../services/prisma.service';

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
      throw new HttpException("Schema isn't exist", HttpStatus.NOT_FOUND);
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
      throw new HttpException("Schema isn't exist", HttpStatus.NOT_FOUND);
    }
  }

  update(options: { code: string; parentCode?: string | null }) {
    const { parentCode } = options;

    return this.prisma.schema.update({
      where: {
        code: options.code,
      },
      data: { ...(parentCode !== undefined ? { parentCode } : null) },
    });
  }

  updateWithRelations(options: {
    payload: CreateSchemaDto;
    code: string;
    parentCode?: string;
  }) {
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
            content: options.payload.body,
          },
        },
        header: {
          create: {
            content: options.payload.header,
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

  create(options: { payload: CreateSchemaDto; parentCode: string }) {
    return this.prisma.schema.create({
      data: {
        parentSchema: {
          connect: {
            code: options.parentCode,
          },
        },

        body: {
          create: {
            content: options.payload.body,
          },
        },
        header: {
          create: {
            content: options.payload.header,
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
