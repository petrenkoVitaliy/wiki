import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ArticleFactory } from './entities/article.factory';
import { ArticleLanguageFactory } from './entities/articleLanguage.factory';
import { ArticleVersionFactory } from './entities/articleVersion.factory';
import { BodyFactory } from './entities/body.factory';
import { CategoryFactory } from './entities/category.factory';
import { HeaderFactory } from './entities/header.factory';
import { LanguageFactory } from './entities/language.factory';
import { SchemaFactory } from './entities/schema.factory';

@Module({
  providers: [
    ArticleVersionFactory,
    BodyFactory,
    HeaderFactory,
    SchemaFactory,
    ArticleFactory,
    ArticleLanguageFactory,
    LanguageFactory,
    CategoryFactory,
  ],
})
class DBFactoryModule {
  constructor(
    public header: HeaderFactory,
    public body: BodyFactory,
    public articleVersion: ArticleVersionFactory,
    public schema: SchemaFactory,
    public article: ArticleFactory,
    public articleLanguage: ArticleLanguageFactory,
    public language: LanguageFactory,
    public category: CategoryFactory,
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
