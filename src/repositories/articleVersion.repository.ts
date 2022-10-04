import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ArticleVersionRepository {
  constructor(private prisma: PrismaService) {}

  findOne(options: { code: string; languageCode: string }) {
    try {
      return this.prisma.articleVersion.findFirstOrThrow({
        where: {
          code: options.code,
          articleLanguage: {
            language: { code: options.languageCode },
          },
        },

        include: {
          schema: {
            include: {
              body: true,
              header: true,
            },
          },
        },
      });
    } catch (ex) {
      throw new HttpException(
        "Article version isn't exist",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  findOneWithSiblings(options: { code: string; languageCode: string }) {
    try {
      return this.prisma.articleVersion.findFirstOrThrow({
        where: {
          code: options.code,
          articleLanguage: {
            language: { code: options.languageCode },
          },
        },
        include: {
          schema: true,
          articleLanguage: {
            include: {
              articleVersion: {
                include: {
                  schema: true,
                },
                orderBy: {
                  version: Prisma.SortOrder.desc,
                },
              },
            },
          },
        },
      });
    } catch (ex) {
      throw new HttpException(
        "Article version isn't exist",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  create(options: { articleLanguageCode: string; schemaCode: string }) {
    return this.prisma.articleVersion.create({
      data: {
        articleLanguageCode: options.articleLanguageCode,
        schemaCode: options.schemaCode,
      },

      include: {
        schema: {
          include: {
            body: true,
            header: true,
          },
        },
      },
    });
  }
}
