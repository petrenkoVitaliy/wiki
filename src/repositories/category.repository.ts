import { Injectable } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}
  async findMany(options: { language: string }) {
    return this.prisma.category.findMany({
      include: {
        articleCategories: {
          where: {
            article: {
              articleLanguage: {
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
                articleLanguage: {
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