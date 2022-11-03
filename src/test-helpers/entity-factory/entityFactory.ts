import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ArticleFactory } from './entities/article.factory';
import { ArticleLanguageFactory } from './entities/articleLanguage.factory';
import { ArticleVersionFactory } from './entities/articleVersion.factory';
import { CategoryFactory } from './entities/category.factory';
import { LanguageFactory } from './entities/language.factory';
import { SchemaFactory } from './entities/schema.factory';
import { SectionFactory } from './entities/section.factory';

@Module({
  providers: [
    ArticleVersionFactory,
    SchemaFactory,
    ArticleFactory,
    ArticleLanguageFactory,
    LanguageFactory,
    CategoryFactory,
    SectionFactory,
  ],
})
class DBFactoryModule {
  constructor(
    public articleVersion: ArticleVersionFactory,
    public schema: SchemaFactory,
    public article: ArticleFactory,
    public articleLanguage: ArticleLanguageFactory,
    public language: LanguageFactory,
    public category: CategoryFactory,
    public section: SectionFactory,
  ) {}
}

class EntityFactory {
  private static instance: DBFactoryModule | null;

  static async initiate() {
    if (!this.instance) {
      const app = await NestFactory.createApplicationContext(DBFactoryModule);
      const module = app.get<DBFactoryModule>(DBFactoryModule);

      this.instance = module;
    }

    return this.instance;
  }
}

export type EntityFactoryModule = DBFactoryModule;
export { EntityFactory };
