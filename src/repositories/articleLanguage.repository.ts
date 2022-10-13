import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateArticleDto } from '../modules/article/article.dtos';

import { PrismaService } from '../prisma/prisma.service';
import { ErrorGenerator } from '../utils/error.generator';
import { convertNameToCode } from '../utils/utils';

@Injectable()
export class ArticleLanguageRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { articleCode: string; languageCode: string; enabled?: boolean }) {
    try {
      const result = await this.prisma.articleLanguage.findFirstOrThrow({
        where: {
          archived: false,
          enabled: options.enabled,

          language: {
            code: options.languageCode,
          },

          article: {
            code: options.articleCode,
            archived: false,
            enabled: options.enabled,
          },
        },

        include: {
          article: true,
          articleVersions: {
            orderBy: {
              version: Prisma.SortOrder.asc,
            },
            include: {
              schema: {
                include: {
                  sections: {
                    include: {
                      section: true,
                    },
                    orderBy: {
                      order: Prisma.SortOrder.asc,
                    },
                  },
                  childSchemas: {
                    where: {
                      articleVersion: null,
                    },
                    orderBy: {
                      createdAt: Prisma.SortOrder.asc,
                    },
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
              },
            },
          },
        },
      });

      return result;
    } catch (ex) {
      throw ErrorGenerator.notFound({ entityName: 'ArticleLanguage' });
    }
  }

  update(
    payload: { name?: string; enabled?: boolean; archived?: boolean },
    options: { code: string },
  ) {
    return this.prisma.articleLanguage.update({
      where: {
        code: options.code,
      },
      data: {
        enabled: payload.enabled,
        archived: payload.archived,
        ...(payload.name
          ? {
              name: payload.name,
              nameCode: convertNameToCode(payload.name),
            }
          : null),
      },
    });
  }

  create(payload: CreateArticleDto, options: { articleCode: string; languageId: number }) {
    return this.prisma.articleLanguage.create({
      data: {
        name: payload.name,
        nameCode: convertNameToCode(payload.name),

        article: {
          connect: {
            code: options.articleCode,
          },
        },

        language: {
          connect: {
            id: options.languageId,
          },
        },

        articleVersions: {
          create: {
            schema: {
              create: {
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
            },
          },
        },
      },
    });
  }
}
