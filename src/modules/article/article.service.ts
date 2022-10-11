import { Injectable } from '@nestjs/common';

import { ArticleLanguageRepository } from '../../repositories/articleLanguage.repository';
import { ArticleRepository } from '../../repositories/article.repository';
import { CreateArticleDto, PatchArticleDto } from './article.dtos';
import { pick } from '../../utils/utils';
import { LanguageRepository } from '../../repositories/language.repository';
import { ErrorGenerator } from '../../utils/error.generator';
import {
  ArticleAggregation,
  ArticleLanguageWithDraftsAggregation,
  ArticlesAggregation,
  ArticleWithVersionsAggregation,
  ArticleResponse,
  ArticleDraftsResponse,
  ArticleShortResponse,
  ArticleVersionShortResponse,
} from './article.types';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private articleLanguageRepository: ArticleLanguageRepository,
    private languageRepository: LanguageRepository,
  ) {}

  async getArticle(options: { code: string; languageCode: string }) {
    const articleAggregation = await this.articleRepository.findOneWithVersions({
      ...options,
      actualVersion: true,
      enabled: true,
    });

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

  async getArticleWithVersions(options: { code: string; languageCode: string }) {
    const articleWithVersions = await this.articleRepository.findOneWithVersions({
      ...options,
      enabled: true,
    });

    return this.mapToVersionsResponse(articleWithVersions);
  }

  async getArticleDrafts(options: { code: string; languageCode: string }) {
    const articleLanguageWithDrafts = await this.articleLanguageRepository.findOne({
      languageCode: options.languageCode,
      articleCode: options.code,
      enabled: true,
    });

    return this.mapToArticleDraftsResponse(articleLanguageWithDrafts);
  }

  async createArticle(payload: CreateArticleDto, options: { languageCode: string }) {
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
        enabled: true,
      }),

      this.languageRepository.findOne({ languageCode: options.languageCode }),
    ]);

    const isArticleLanguageExists = article.articleLanguages.find(
      (articleLanguage) => articleLanguage.language.code === language.code,
    );

    if (isArticleLanguageExists) {
      throw ErrorGenerator.duplicateEntity({ entityName: 'ArticleLanguage' });
    }

    await this.articleLanguageRepository.create(payload, {
      languageId: language.id,
      articleCode: article.code,
    });

    const updatedArticle = await this.articleRepository.findOneWithVersions({
      ...options,
      actualVersion: true,
    });

    return this.mapToArticleResponse(updatedArticle, {
      languageCode: options.languageCode,
    });
  }

  async deleteArticle(options: { code: string }) {
    const updatedArticle = await this.articleRepository.update({ archived: true }, options);

    return {
      code: updatedArticle.code,
    };
  }

  async patchArticle(payload: PatchArticleDto, options: { code: string; languageCode: string }) {
    const updatedArticle = await this.articleRepository.update(payload, options);

    return this.mapToArticleResponse(updatedArticle, {
      languageCode: options.languageCode,
    });
  }

  private mapToArticleDraftsResponse(
    articleLanguageWithDrafts: ArticleLanguageWithDraftsAggregation,
  ): ArticleDraftsResponse {
    const articleVersions: ArticleDraftsResponse['articleVersions'] =
      articleLanguageWithDrafts.articleVersions.map((articleVersion) => {
        return {
          ...pick(articleVersion, ['version', 'code']),
          schema: {
            code: articleVersion.schema.code,

            section: articleVersion.schema.sections.map((section) => ({
              content: section.content,
            })),
          },
          drafts: articleVersion.schema.childSchemas.map((childSchema) => {
            return {
              code: childSchema.code,

              section: childSchema.sections.map((section) => ({ content: section.content })),
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
  ): ArticleVersionShortResponse[] {
    const versions: ArticleVersionShortResponse[] = [];

    articleWithVersions.articleLanguages.forEach((articleLanguage) => {
      articleLanguage.articleVersions.forEach((articleVersion) => {
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
  ): ArticleResponse {
    const { articleLanguage, additionalLanguages } = articleAggregation.articleLanguages.reduce(
      (acc, articleLanguage) => {
        if (articleLanguage.language.code === options.languageCode) {
          acc.articleLanguage = articleLanguage;
        } else {
          acc.additionalLanguages.push(articleLanguage);
        }

        return acc;
      },
      { articleLanguage: null, additionalLanguages: [] } as {
        articleLanguage: ArticleAggregation['articleLanguages'][0] | null;
        additionalLanguages: ArticleAggregation['articleLanguages'];
      },
    );

    if (!articleLanguage) {
      throw ErrorGenerator.invalidEntity({ entityName: 'ArticleLanguage' });
    }

    const articleVersion = articleLanguage.articleVersions[0];

    if (!articleVersion || !articleVersion.actual) {
      throw ErrorGenerator.invalidEntity({ entityName: 'ArticleVersion' });
    }

    const languages = additionalLanguages.length
      ? additionalLanguages.map((additionalLanguage) => additionalLanguage.language.code)
      : [];

    return {
      ...pick(articleAggregation, ['code', 'type']),

      languages,

      articleLanguage: {
        ...pick(articleLanguage, ['name', 'code']),

        version: {
          ...pick(articleVersion, ['code', 'version']),

          schema: {
            ...pick(articleVersion.schema, ['code']),

            section: articleVersion.schema.sections.map((section) => ({
              content: section.content,
            })),
          },
        },
      },
    };
  }

  private mapToAllArticlesResponse(
    articlesAggregations: ArticlesAggregation[],
  ): ArticleShortResponse[] {
    return articlesAggregations.map((articleAggregation) => {
      const articleLanguage = articleAggregation.articleLanguages[0];

      if (!articleLanguage) {
        throw ErrorGenerator.invalidEntity({ entityName: 'ArticleLanguage' });
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
