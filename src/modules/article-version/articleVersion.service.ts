import { Injectable } from '@nestjs/common';

import { convertNullable, pick } from '../../utils/utils';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { ArticleVersionAggregation, MappedArticleVersion } from './articleVersion.types';
import { PatchArticleVersionDto } from './articleVersion.dtos';

@Injectable()
export class ArticleVersionService {
  constructor(private articleVersionRepository: ArticleVersionRepository) {}

  async getArticleVersion(options: {
    code: string;
    languageCode: string;
  }): Promise<MappedArticleVersion> {
    const articleVersion = await this.articleVersionRepository.findOne({
      ...options,
      enabled: true,
    });

    return this.mapToArticleVersionResponse(articleVersion);
  }

  async patchArticleVersion(options: { code: string; payload: PatchArticleVersionDto }) {
    const articleVersion = await this.articleVersionRepository.update(
      {
        code: options.code,
        isExtended: true,
      },
      options.payload,
    );

    return this.mapToArticleVersionResponse(articleVersion);
  }

  async deleteArticleVersion(options: { code: string }) {
    const articleVersion = await this.articleVersionRepository.update(
      {
        code: options.code,
      },
      { archived: true },
    );

    return {
      code: articleVersion.code,
    };
  }

  private mapToArticleVersionResponse(
    articleVersion: ArticleVersionAggregation,
  ): MappedArticleVersion {
    return {
      ...pick(articleVersion, ['code', 'version']),

      schema: {
        ...pick(articleVersion.schema, ['code']),

        ...convertNullable(articleVersion.schema.body, (body) => ({
          body: {
            ...pick(body, ['content']),
          },
        })),

        ...convertNullable(articleVersion.schema.header, (header) => ({
          header: {
            ...pick(header, ['content']),
          },
        })),
      },
    };
  }
}
