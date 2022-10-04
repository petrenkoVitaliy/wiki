import { HttpException, Injectable, HttpStatus } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ArticleLanguageRepository {
  constructor(private prisma: PrismaService) {}

  findOne(options: { articleCode: string; languageCode: string }) {
    try {
      return this.prisma.articleLanguage.findFirstOrThrow({
        where: {
          enabled: true,
          language: {
            code: options.languageCode,
          },
          article: {
            code: options.articleCode,
            // enabled: true, // TODO
            // archived: false,
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
    } catch (ex) {
      throw new HttpException(
        "Article language isn't exist",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getAdditionalLanguages(options: {
    articleCode: string;
    languageCodeToExclude?: string;
  }) {
    return this.prisma.articleLanguage.findMany({
      where: {
        article: {
          code: options.articleCode,
        },
        NOT: {
          language: {
            code: options.languageCodeToExclude,
          },
        },
      },
      include: {
        language: true,
      },
    });
  }
}
