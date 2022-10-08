import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArticleType, Prisma } from '@prisma/client';

import { convertNameToCode } from '../utils/utils';
import { CreateArticleDto } from '../modules/article/article.dtos';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateArticleOptions } from '../modules/article/article.types';

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
          articleLanguage: {
            include: {
              language: true,
            },
          },
        },
      });

      return result;
    } catch (ex) {
      throw new HttpException("Article isn't exist", HttpStatus.NOT_FOUND);
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
          articleLanguage: {
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
          articleLanguage: {
            include: {
              language: true,
              articleVersion: {
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
                      body: true,
                      header: true,
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
      throw new HttpException("Article isn't exist", HttpStatus.NOT_FOUND);
    }
  }

  findMany(options: { languageCode: string }) {
    return this.prisma.article.findMany({
      where: {
        archived: false,
        enabled: true,

        articleLanguage: {
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
        articleLanguage: {
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

          articleLanguage: {
            create: {
              name: payload.name,
              nameCode: convertNameToCode(payload.name),

              language: {
                connect: {
                  id: options.languageId,
                },
              },

              articleVersion: {
                create: {
                  schema: {
                    create: {
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
                  },
                },
              },
            },
          },
        },
        include: {
          articleLanguage: {
            include: {
              language: true,
              articleVersion: {
                where: {
                  actual: true,
                },
                include: {
                  schema: {
                    include: {
                      body: true,
                      header: true,
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
          throw new HttpException('Article name must be unique', HttpStatus.CONFLICT);
        }
      }
      throw ex;
    }
  }

  async update(payload: UpdateArticleOptions, options: { code: string; actualVersion?: boolean }) {
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
          articleLanguage: {
            include: {
              language: true,
              articleVersion: {
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
                      body: true,
                      header: true,
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
      throw new HttpException("Article isn't exist", HttpStatus.NOT_FOUND);
    }
  }
}
