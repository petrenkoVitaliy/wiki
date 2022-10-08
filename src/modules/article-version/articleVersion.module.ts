import { Module } from '@nestjs/common';

import { ArticleVersionController } from './articleVersion.controller';
import { ArticleVersionService } from './articleVersion.service';

import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';

@Module({
  controllers: [ArticleVersionController],
  providers: [ArticleVersionService, ArticleVersionRepository],
})
export class ArticleVersionModule {}
