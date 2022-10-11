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

  public async createLanguages(params: { code: string }[]) {
    return this.createEntities(this.prisma.language.create, params);
  }
}
