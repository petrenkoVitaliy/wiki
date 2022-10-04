import { Injectable } from '@nestjs/common';

import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';
import { ArticleRepository } from '../../repositories/article.repository';
import { CreateArticleDto } from './article.dtos';
import { convertNullable, pick } from '../../utils/utils';
import { LanguageRepository } from '../../repositories/language.repository';
import {
  ArticleAggregation,
  ArticleLanguageWithDraftsAggregation,
  ArticlesAggregation,
  ArticleWithVersionsAggregation,
  LanguageAggregation,
  MappedArticle,
  MappedArticleDrafts,
  MappedArticleShort,
  MappedVersion,
} from './article.types';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private articleLanguageRepository: ArticleLanguageRepository,
    private languageRepository: LanguageRepository,
  ) {}

  async getArticle(options: { code: string; languageCode: string }) {
    const [articleAggregation, additionalLanguages] = await Promise.all([
      this.articleRepository.findOne(options),
      this.articleLanguageRepository.getAdditionalLanguages({
        articleCode: options.code,
        languageCodeToExclude: options.languageCode,
      }),
    ]);

    return this.mapToArticleResponse(articleAggregation, additionalLanguages);
  }

  async getAllArticles(languageCode: string) {
    const articlesAggregation = await this.articleRepository.findMany({
      languageCode,
    });

    return this.mapToAllArticlesResponse(articlesAggregation);
  }

  async getArticlesWithVersions(options: {
    code: string;
    languageCode: string;
  }) {
    const articleWithVersions = await this.articleRepository.findOne(options);

    return this.mapToVersionsResponse(articleWithVersions);
  }

  async getArticleDrafts(options: { code: string; languageCode: string }) {
    const articleLanguageWithDrafts =
      await this.articleLanguageRepository.findOne({
        languageCode: options.languageCode,
        articleCode: options.code,
      });

    return this.mapToArticleDraftsResponse(articleLanguageWithDrafts);
  }

  async createArticle(
    payload: CreateArticleDto,
    options: { languageCode: string },
  ) {
    const language = await this.languageRepository.findOne(options);

    const article = await this.articleRepository.create(payload, {
      languageId: language.id,
    });

    return article;
  }

  private mapToArticleDraftsResponse(
    articleLanguageWithDrafts: ArticleLanguageWithDraftsAggregation,
  ): MappedArticleDrafts {
    const articleVersions: MappedArticleDrafts['articleVersions'] =
      articleLanguageWithDrafts.articleVersion.map((articleVersion) => {
        return {
          ...pick(articleVersion, ['version', 'code']),
          schema: {
            code: articleVersion.schema.code,

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
          drafts: articleVersion.schema.childSchema.map((childSchema) => {
            return {
              code: childSchema.code,

              ...convertNullable(childSchema.body, (body) => ({
                body: {
                  ...pick(body, ['content']),
                },
              })),
              ...convertNullable(childSchema.header, (header) => ({
                header: {
                  ...pick(header, ['content']),
                },
              })),
            };
          }),
        };
      });

    return {
      code: articleLanguageWithDrafts.article.code,

      articleLanguage: {
        name: articleLanguageWithDrafts.name,
        code: articleLanguageWithDrafts.code,
      },

      articleVersions,
    };
  }

  private mapToVersionsResponse(
    articleWithVersions: ArticleWithVersionsAggregation,
  ): MappedVersion[] {
    const versions: MappedVersion[] = [];

    articleWithVersions.articleLanguage.forEach((articleLanguage) => {
      articleLanguage.articleVersion.forEach((articleVersion) => {
        versions.push({
          code: articleVersion.code,
          version: articleVersion.version,
        });
      });
    });

    return versions;
  }

  private mapToArticleResponse(
    articleAggregation: ArticleAggregation,
    additionalLanguages?: LanguageAggregation[],
  ): MappedArticle {
    const articleLanguage = articleAggregation.articleLanguage[0];

    if (!articleLanguage) {
      throw new Error('articleLanguage should exist');
    }

    const articleVersion = articleLanguage.articleVersion[0];

    if (!articleVersion) {
      throw new Error('articleVersion should exist');
    }

    const languages = additionalLanguages
      ? additionalLanguages.map(
          (additionalLanguage) => additionalLanguage.language.code,
        )
      : undefined;

    return {
      ...pick(articleAggregation, ['code', 'type']),

      languages,

      articleLanguage: {
        ...pick(articleLanguage, ['name']),

        version: {
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
        },
      },
    };
  }

  private mapToAllArticlesResponse(
    articlesAggregations: ArticlesAggregation[],
  ): MappedArticleShort[] {
    return articlesAggregations.map((articleAggregation) => {
      const articleLanguage = articleAggregation.articleLanguage[0];

      if (!articleLanguage) {
        throw new Error('articleLanguage should exist');
      }

      return {
        ...pick(articleAggregation, ['code', 'type']),

        articleLanguage: {
          ...pick(articleLanguage, ['name']),
        },
      };
    });
  }
}
