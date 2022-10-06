import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArticleType, Prisma } from '@prisma/client';

import { convertNameToCode } from '../utils/utils';
import { CreateArticleDto } from '../modules/article/article.dtos';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { code: string }) {
    try {
      const result = await this.prisma.article.findUniqueOrThrow({
        where: {
          code: options.code,
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

  async findOneWithVersions(options: { languageCode: string; code: string }) {
    try {
      const result = await this.prisma.article.findFirstOrThrow({
        where: {
          code: options.code,
          articleLanguage: {
            some: {
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
                include: {
                  schema: {
                    include: {
                      body: true,
                      header: true,
                    },
                  },
                },

                orderBy: {
                  version: Prisma.SortOrder.desc,
                },
                take: 1,
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
        articleLanguage: {
          some: {
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
          enabled: false,
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
                include: {
                  schema: {
                    include: {
                      body: true,
                      header: true,
                    },
                  },
                },

                orderBy: {
                  version: Prisma.SortOrder.desc,
                },
                take: 1,
              },
            },
          },
        },
      });

      return result;
    } catch (ex) {
      if (ex instanceof Prisma.PrismaClientKnownRequestError) {
        if (ex.code === 'P2002') {
          throw new HttpException(
            'Article name must be unique',
            HttpStatus.CONFLICT,
          );
        }
      }
      throw ex;
    }
  }
}
