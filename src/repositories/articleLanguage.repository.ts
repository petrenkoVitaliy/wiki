import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { CreateArticleDto } from '../modules/article/article.dtos';

import { PrismaService } from '../services/prisma.service';
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
          articleVersion: {
            include: {
              schema: {
                include: {
                  body: true,
                  header: true,
                  childSchema: {
                    where: {
                      articleVersion: null,
                    },
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
      throw new HttpException("Article language isn't exist", HttpStatus.NOT_FOUND);
    }
  }

  async create(payload: CreateArticleDto, options: { articleCode: string; languageId: number }) {
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
    });
  }
}
