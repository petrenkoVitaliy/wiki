import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Argument, Conditional } from 'src/types/utilityTypes';

import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ArticleVersionRepository {
  constructor(private prisma: PrismaService) {}

  private UpdateMethodType: typeof this.prisma.articleVersion.update;

  async findOne(options: { code: string; languageCode: string; enabled?: boolean }) {
    try {
      const result = await this.prisma.articleVersion.findFirstOrThrow({
        where: {
          code: options.code,
          enabled: options.enabled,
          archived: false,
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

      return result;
    } catch (ex) {
      throw new HttpException("Article version isn't exist", HttpStatus.NOT_FOUND);
    }
  }

  async findActualSibling(options: { code: string; languageCode: string }) {
    try {
      const result = await this.prisma.articleVersion.findFirstOrThrow({
        where: {
          actual: true,
          archived: false,
          enabled: true,

          articleLanguage: {
            language: { code: options.languageCode },
            archived: false,
            enabled: true,

            articleVersion: {
              some: {
                code: options.code,
                archived: false,
                enabled: true,
              },
            },
          },
        },
        include: {
          schema: true,
        },
      });

      return result;
    } catch (ex) {
      throw new HttpException("Article version isn't exist", HttpStatus.NOT_FOUND);
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

  update<T extends boolean>(options: {
    code: string;
    actual?: true | null;
    archived?: boolean;
    enabled?: boolean;
    isExtended?: T;
  }) {
    const updateOptions = {
      where: {
        code: options.code,
      },
      data: {
        actual: options.actual,
        archived: options.archived,
        enabled: options.enabled,
      },
    };

    const include = {
      schema: {
        include: {
          body: true,
          header: true,
        },
      },
    };

    return this.updateExtended({
      updateOptions,
      include,
      isExtended: options.isExtended,
    });
  }

  private updateExtended<
    T extends boolean,
    P extends Pick<Argument<typeof this.UpdateMethodType>, 'data' | 'where'>,
    R extends Argument<typeof this.UpdateMethodType>['include'],
  >(options: { updateOptions: P; isExtended?: T; include: R }) {
    const { updateOptions, include } = options;

    type A1 = ReturnType<
      typeof this.UpdateMethodType<typeof updateOptions & { include: typeof include }>
    >;

    type A2 = ReturnType<typeof this.UpdateMethodType<typeof updateOptions>>;

    type UpdateResult = Conditional<T, A1, A2>;

    return this.prisma.articleVersion.update({
      ...updateOptions,
      include: options.isExtended ? include : null,
    }) as UpdateResult;
  }
}

// TODO

// type ArticleUpdateResult<
// Args extends Parameters<typeof this.prisma.articleVersion.update>[0],
// > = ReturnType<typeof this.prisma.articleVersion.update<Args>>;
//
//
//----------
// type ArticleUpdateResult<T extends Prisma.ArticleVersionUpdateArgs> =
//   Prisma.CheckSelect<
//     T,
//     Prisma.Prisma__ArticleVersionClient<ArticleVersion>,
//     Prisma.Prisma__ArticleVersionClient<Prisma.ArticleVersionGetPayload<T>>
//   >;

// type UpdateResult = T extends true
//   ? ArticleUpdateResult<typeof updateOptions & { include: typeof include }>
//   : ArticleUpdateResult<typeof updateOptions>;
