import { Injectable } from '@nestjs/common';
import { ArticleType, Prisma } from '@prisma/client';

import { convertNameToCode } from '../utils/utils';
import { CreateArticleDto } from '../modules/article/article.dtos';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorGenerator } from '../utils/error.generator';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { code: string; enabled?: boolean }) {
    try {
      const result = await this.prisma.article.findFirstOrThrow({
        where: {
          code: options.code,
          archived: false,
          enabled: options.enabled,
        },
        include: {
          articleLanguages: {
            include: {
              language: true,
            },
          },
        },
      });

      return result;
    } catch (ex) {
      throw ErrorGenerator.notFound({ entityName: 'Article' });
    }
  }

  async findOneWithVersions(options: {
    languageCode: string;
    code: string;
    actualVersion?: boolean;
    enabled?: boolean;
  }) {
    try {
      const result = await this.prisma.article.findFirstOrThrow({
        where: {
          code: options.code,
          archived: false,
          enabled: options.enabled,
          articleLanguages: {
            some: {
              archived: false,
              enabled: options.enabled,
              language: {
                code: options.languageCode,
              },
            },
          },
        },
        include: {
          articleLanguages: {
            include: {
              language: true,
              articleVersions: {
                ...(options.actualVersion
                  ? { where: { actual: true } }
                  : {
                      orderBy: {
                        version: Prisma.SortOrder.desc,
                      },
                      take: 1,
                    }),

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
      throw ErrorGenerator.notFound({ entityName: 'Article' });
    }
  }

  findMany(options: { languageCode: string }) {
    return this.prisma.article.findMany({
      where: {
        archived: false,
        enabled: true,

        articleLanguages: {
          some: {
            archived: false,
            enabled: true,

            language: {
              code: options.languageCode,
            },
          },
        },
      },

      include: {
        articleLanguages: {
          where: {
            language: {
              code: options.languageCode,
            },
          },

          include: {
            language: true,
          },
        },
      },
    });
  }

  async create(payload: CreateArticleDto, options: { languageId: number }) {
    try {
      const result = await this.prisma.article.create({
        data: {
          type: ArticleType.common,

          ...(payload.categoriesIds.length
            ? {
                articleCategories: {
                  create: payload.categoriesIds.map((categoryId) => ({
                    category: {
                      connect: {
                        id: categoryId,
                      },
                    },
                  })),
                },
              }
            : null),

          articleLanguages: {
            create: {
              name: payload.name,
              nameCode: convertNameToCode(payload.name),

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
          },
        },
        include: {
          articleLanguages: {
            include: {
              language: true,
              articleVersions: {
                where: {
                  actual: true,
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
      if (ex instanceof Prisma.PrismaClientKnownRequestError) {
        if (ex.code === 'P2002') {
          throw ErrorGenerator.notUniqueProperty({ propertyName: 'Article name' });
        }
      }
      throw ex;
    }
  }

  async update(
    payload: {
      enabled?: boolean;
      archived?: boolean;
      type?: ArticleType;
    },
    options: { code: string; actualVersion?: boolean },
  ) {
    try {
      const result = await this.prisma.article.update({
        where: {
          code: options.code,
        },
        data: {
          enabled: payload.enabled,
          archived: payload.archived,
          type: payload.type,
        },
        include: {
          articleLanguages: {
            include: {
              language: true,
              articleVersions: {
                ...(options.actualVersion
                  ? { where: { actual: true } }
                  : {
                      orderBy: {
                        version: Prisma.SortOrder.desc,
                      },
                      take: 1,
                    }),

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
      throw ErrorGenerator.notFound({ entityName: 'Article' });
    }
  }
}
