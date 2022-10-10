import { Injectable } from '@nestjs/common';
import { Argument, Conditional } from 'src/types/utilityTypes';

import { PrismaService } from '../prisma/prisma.service';
import { ErrorGenerator } from '../utils/error.generator';

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
      throw ErrorGenerator.notFound({ entityName: 'ArticleVersion' });
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
      throw ErrorGenerator.notFound({ entityName: 'ArticleVersion' });
    }
  }

  create(payload: { articleLanguageCode: string; schemaCode: string }) {
    return this.prisma.articleVersion.create({
      data: {
        articleLanguageCode: payload.articleLanguageCode,
        schemaCode: payload.schemaCode,
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

  update<T extends boolean>(
    payload: { actual?: true | null; archived?: boolean; enabled?: boolean },
    options: {
      code: string;
      isExtended?: T;
    },
  ) {
    const updateOptions = {
      where: {
        code: options.code,
      },
      data: {
        actual: payload.actual,
        archived: payload.archived,
        enabled: payload.enabled,
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

    return this.prisma.articleVersion.update({
      ...updateOptions,
      include: options.isExtended ? include : null,
    }) as Conditional<
      T,
      ReturnType<typeof this.UpdateMethodType<typeof updateOptions & { include: typeof include }>>,
      ReturnType<typeof this.UpdateMethodType<typeof updateOptions>>
    >;
  }
}
