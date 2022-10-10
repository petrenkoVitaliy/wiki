import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';

import { ROUTES } from '../../routes/routes';

import { AppService } from './app.service';
import { ArticleModule } from '../article/article.module';
import { AppController } from './app.controller';
import { CategoryModule } from '../category/category.module';
import { SchemaModule } from '../schema/schema.module';
import { ArticleVersionModule } from '../article-version/articleVersion.module';
import { ArticleLanguageModule } from '../article-language/articleLanguage.module';
import { PrismaModule } from '../../prisma/prisma.module';

@ApiTags('app')
@Module({
  imports: [
    PrismaModule.forRoot({ global: true }),
    ArticleModule,
    CategoryModule,
    SchemaModule,
    ArticleVersionModule,
    ArticleLanguageModule,
    RouterModule.register(ROUTES),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
