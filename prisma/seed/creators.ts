import { PrismaClient, PrismaPromise } from '@prisma/client';

type GetResponse<X> = X extends PrismaPromise<infer I> ? I : never;

export class Creators {
  constructor(private prisma: PrismaClient) {}

  private createEntities<T, M extends (options: { data: T }) => ReturnType<M>>(
    query: M,
    options: T[],
  ) {
    return Promise.all(
      options.map((option) =>
        query({
          data: { ...option },
        }),
      ),
    ) as Promise<GetResponse<ReturnType<M>>[]>;
  }

  public async createArticleCategories(
    params: {
      articleCode: string;
      categoryId: number;
    }[],
  ) {
    return this.createEntities(this.prisma.articleCategory.create, params);
  }

  public async createCategories(
    params: {
      name: string;
      description: string;
      parentId?: number;
    }[],
  ) {
    return this.createEntities(this.prisma.category.create, params);
  }

  public async createArticleVersions(
    params: {
      articleLanguageCode: string;
      schemaCode: string;
    }[],
  ) {
    return this.createEntities(this.prisma.articleVersion.create, params);
  }

  public async createBody(
    params: {
      content: string;
    }[],
  ) {
    return this.createEntities(this.prisma.body.create, params);
  }

  public async createSchema(
    params: {
      bodyId: number;
      parentCode: string | null;
    }[],
  ) {
    return this.createEntities(this.prisma.schema.create, params);
  }

  public async createArticles(params: any[]) {
    return this.createEntities(this.prisma.article.create, params);
  }

  public async createArticleLanguages(
    params: {
      name: string;
      articleCode: string;
      languageId: number;
      nameCode: string;
    }[],
  ) {
    return this.createEntities(this.prisma.articleLanguage.create, params);
  }

  public async createLanguages(params: { code: string }[]) {
    return this.createEntities(this.prisma.language.create, params);
  }
}
