import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  findMany(options: { language: string }) {
    return this.prisma.category.findMany({
      where: {
        enabled: true,
        archived: false,
      },
      include: {
        articleCategories: {
          where: {
            article: {
              articleLanguages: {
                some: {
                  language: {
                    code: options.language,
                  },
                },
              },
            },
          },
          include: {
            article: {
              include: {
                articleLanguages: {
                  where: {
                    language: {
                      code: options.language,
                    },
                  },
                  include: {
                    language: true,
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
