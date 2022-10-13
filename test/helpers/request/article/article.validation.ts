import { ArticleType } from '@prisma/client';
import { CreateArticleDto } from '../../../../src/modules/article/article.dtos';
import { ArticleResponse } from '../../../../src/modules/article/article.types';
import { SchemaResponse } from '../../../../src/modules/schema/schema.types';

const getArticle = (
  body: unknown,
  options: {
    code: string;
    createdLanguages: string[];
    articleResponse: ArticleResponse;
  },
) => {
  expect(body).toMatchObject({
    code: options.code,
    type: ArticleType.common,
    languages: options.createdLanguages,
    articleLanguage: {
      name: options.articleResponse.articleLanguage.name,
      version: {
        schema: {
          sections: options.articleResponse.articleLanguage.version.schema.sections,
        },
      },
    },
  });
};

const createArticle = (
  body: unknown,
  options: {
    articleDto: CreateArticleDto;
  },
) => {
  expect(body).toMatchObject({
    type: ArticleType.common,
    languages: [],
    articleLanguage: {
      name: options.articleDto.name,
      version: {
        version: 1,
        schema: {
          sections: options.articleDto.sections,
        },
      },
    },
  });
};

const patchArticle = (
  body: unknown,
  options: {
    name: string;
    sections: { name: string; content: string }[];
  },
) => {
  expect(body).toMatchObject({
    type: ArticleType.common,
    languages: [],
    articleLanguage: {
      name: options.name,
      version: {
        version: 1,
        schema: {
          sections: options.sections,
        },
      },
    },
  });
};

const getArticleDrafts = (
  body: unknown,
  options: {
    article: ArticleResponse;
    articleVersions: {
      version: number;
      schemaDto: {
        sections: { content: string; name: string }[];
      };
      drafts: SchemaResponse[];
    }[];
  },
) => {
  expect(body).toMatchObject({
    articleLanguage: {
      name: options.article.articleLanguage.name,
    },
    articleVersions: options.articleVersions.map((articleVersion) => ({
      version: articleVersion.version,
      schema: {
        sections: articleVersion.schemaDto.sections,
      },
      drafts: articleVersion.drafts.map((draft) => ({
        sections: draft.sections,
      })),
    })),
  });
};

const addArticleLanguage = (
  body: unknown,
  options: {
    createdLanguages: string[];
    articleDto: CreateArticleDto;
  },
) => {
  expect(body).toMatchObject({
    type: ArticleType.common,
    languages: options.createdLanguages,
    articleLanguage: {
      name: options.articleDto.name,
      version: {
        version: 1,
        schema: {
          sections: options.articleDto.sections,
        },
      },
    },
  });
};

export const articleValidations = {
  getArticle,
  createArticle,
  patchArticle,
  getArticleDrafts,
  addArticleLanguage,
};
