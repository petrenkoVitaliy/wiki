import { Routes } from '@nestjs/core';
import { mapToRoutes } from './routes.helpers';
import { PrefixedRouteTree } from './routes.types';

import { SchemaModule } from '../modules/schema/schema.module';
import { AppModule } from '../modules/app/app.module';
import { ArticleVersionModule } from '../modules/article-version/articleVersion.module';
import { ArticleModule } from '../modules/article/article.module';
import { CategoryModule } from '../modules/category/category.module';

const prefixedRoutes: PrefixedRouteTree[] = [
  {
    path: '',
    module: AppModule,

    prefixedChildren: {
      prefix: ':language',
      children: [
        {
          path: 'article',
          module: ArticleModule,
        },
        {
          path: 'article-version',
          module: ArticleVersionModule,
          prefixedChildren: {
            prefix: ':article_version_code',
            children: [
              {
                path: 'schema',
                module: SchemaModule,
              },
            ],
          },
        },
        {
          path: 'category',
          module: CategoryModule,
        },
      ],
    },
  },
];

export const ROUTES: Routes = mapToRoutes(prefixedRoutes);
