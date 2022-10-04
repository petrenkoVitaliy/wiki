import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArticleType, Prisma } from '@prisma/client';

import { convertNameToCode } from '../utils/utils';
import { CreateArticleDto } from '../modules/article/article.dtos';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  findOne(options: { languageCode: string; code: string }) {
    try {
      return this.prisma.article.findFirstOrThrow({
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

  create(payload: CreateArticleDto, options: { languageId: number }) {
    return this.prisma.article.create({
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
    });
  }
}
