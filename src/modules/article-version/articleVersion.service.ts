import { Injectable } from '@nestjs/common';

import { pick } from '../../utils/utils';
import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { ArticleVersionAggregation, ArticleVersionResponse } from './articleVersion.types';
import { PatchArticleVersionDto } from './articleVersion.dtos';

@Injectable()
export class ArticleVersionService {
  constructor(private articleVersionRepository: ArticleVersionRepository) {}

  async getArticleVersion(options: {
    code: string;
    languageCode: string;
  }): Promise<ArticleVersionResponse> {
    const articleVersion = await this.articleVersionRepository.findOne({
      ...options,
      enabled: true,
    });

    return this.mapToArticleVersionResponse(articleVersion);
  }

  async patchArticleVersion(options: { code: string; payload: PatchArticleVersionDto }) {
    const articleVersion = await this.articleVersionRepository.update(options.payload, {
      code: options.code,
      isExtended: true,
    });

    return this.mapToArticleVersionResponse(articleVersion);
  }

  async deleteArticleVersion(options: { code: string }) {
    const articleVersion = await this.articleVersionRepository.update(
      { archived: true },
      {
        code: options.code,
      },
    );

    return {
      code: articleVersion.code,
    };
  }

  private mapToArticleVersionResponse(
    articleVersion: ArticleVersionAggregation,
  ): ArticleVersionResponse {
    return {
      ...pick(articleVersion, ['code', 'version']),

      schema: {
        ...pick(articleVersion.schema, ['code']),

        sections: articleVersion.schema.sections.map((section) => ({
          content: section.content,
        })),
      },
    };
  }
}
