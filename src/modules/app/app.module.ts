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

@ApiTags('app')
@Module({
  imports: [
    ArticleModule,
    CategoryModule,
    SchemaModule,
    ArticleVersionModule,
    RouterModule.register(ROUTES),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
