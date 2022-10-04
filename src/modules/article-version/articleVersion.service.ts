import { Injectable } from '@nestjs/common';

import { convertNullable, pick } from '../../utils/utils';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import {
  ArticleVersionAggregation,
  MappedArticleVersion,
} from './articleVersion.types';

@Injectable()
export class ArticleVersionService {
  constructor(private articleVersionRepository: ArticleVersionRepository) {}

  async getArticleVersion(options: {
    code: string;
    languageCode: string;
  }): Promise<MappedArticleVersion> {
    const articleVersion = await this.articleVersionRepository.findOne(options);

    return this.mapToArticleVersionResponse(articleVersion);
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