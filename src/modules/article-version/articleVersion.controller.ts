import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PatchArticleVersionDto } from './articleVersion.dtos';
import { ArticleVersionService } from './articleVersion.service';

@ApiTags('article-version')
@Controller()
export class ArticleVersionController {
  constructor(private readonly articleVersionService: ArticleVersionService) {}

  @Get('/:code')
  getArticleVersion(@Param('language') languageCode: string, @Param('code') code: string) {
    return this.articleVersionService.getArticleVersion({
      code,
      languageCode,
    });
  }

  @Patch('/:code')
  patchArticleVersion(@Param('code') code: string, @Body() payload: PatchArticleVersionDto) {
    return this.articleVersionService.patchArticleVersion({
      code,
      payload,
    });
  }

  @Delete('/:code')
  deleteArticleVersion(@Param('code') code: string) {
    return this.articleVersionService.deleteArticleVersion({
      code,
    });
  }
}
