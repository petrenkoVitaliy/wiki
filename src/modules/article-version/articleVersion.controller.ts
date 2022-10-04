import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleVersionService } from './articleVersion.service';

@ApiTags('article-version')
@Controller()
export class ArticleVersionController {
  constructor(private readonly articleVersionService: ArticleVersionService) {}

  @Get('/:code')
  getArticleVersion(
    @Param('language') languageCode: string,
    @Param('code') code: string,
  ) {
    return this.articleVersionService.getArticleVersion({
      code,
      languageCode,
    });
  }
}
