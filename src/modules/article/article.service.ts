import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

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
    const articleAggregation = await this.articleRepository.findOneWithVersions(
      options,
    );

    return this.mapToArticleResponse(articleAggregation, {
      languageCode: options.languageCode,
    });
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
    const articleWithVersions =
      await this.articleRepository.findOneWithVersions(options);

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

    return this.mapToArticleResponse(article, {
      languageCode: options.languageCode,
    });
  }

  async addArticleLanguage(
    payload: CreateArticleDto,
    options: { languageCode: string; code: string },
  ) {
    const [article, language] = await Promise.all([
      this.articleRepository.findOne({
        code: options.code,
      }),

      this.languageRepository.findOne({ languageCode: options.languageCode }),
    ]);

    const isArticleLanguageExists = article.articleLanguage.find(
      (articleLanguage) => articleLanguage.language.code === language.code,
    );

    if (isArticleLanguageExists) {
      throw new HttpException(
        'ArticleLanguage already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.articleLanguageRepository.create(payload, {
      languageId: language.id,
      articleCode: article.code,
    });

    const updatedArticle = await this.articleRepository.findOneWithVersions(
      options,
    );

    return this.mapToArticleResponse(updatedArticle, {
      languageCode: options.languageCode,
    });
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
    options: { languageCode: string },
  ): MappedArticle {
    const { articleLanguage, additionalLanguages } =
      articleAggregation.articleLanguage.reduce(
        (acc, articleLanguage) => {
          if (articleLanguage.language.code === options.languageCode) {
            acc.articleLanguage = articleLanguage;
          } else {
            acc.additionalLanguages.push(articleLanguage);
          }

          return acc;
        },
        { articleLanguage: null, additionalLanguages: [] } as {
          articleLanguage: ArticleAggregation['articleLanguage'][0] | null;
          additionalLanguages: ArticleAggregation['articleLanguage'];
        },
      );

    if (!articleLanguage) {
      throw new HttpException(
        'ArticleLanguage should exist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const articleVersion = articleLanguage.articleVersion[0];

    if (!articleVersion) {
      throw new HttpException(
        'ArticleVersion should exist',
        HttpStatus.BAD_REQUEST,
      );
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
        throw new HttpException(
          'ArticleLanguage should exist',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
