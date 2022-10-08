import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateArticleDto, PatchArticleDto } from './article.dtos';
import { ArticleService } from './article.service';

@ApiTags('article')
@Controller()
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('')
  getAllArticles(@Param('language') languageCode: string) {
    return this.articleService.getAllArticles(languageCode);
  }

  @Get('/:code')
  getArticle(@Param('code') code: string, @Param('language') languageCode: string) {
    return this.articleService.getArticle({
      code,
      languageCode,
    });
  }

  @Get('/:code/version')
  getArticleWithVersions(@Param('code') code: string, @Param('language') languageCode: string) {
    return this.articleService.getArticleWithVersions({
      code,
      languageCode,
    });
  }

  @Get('/:code/draft')
  getArticleDrafts(@Param('code') code: string, @Param('language') languageCode: string) {
    return this.articleService.getArticleDrafts({
      code,
      languageCode,
    });
  }

  @Post()
  createArticle(@Param('language') languageCode: string, @Body() payload: CreateArticleDto) {
    return this.articleService.createArticle(payload, { languageCode });
  }

  @Post('/:code')
  addArticleLanguage(
    @Param('language') languageCode: string,
    @Param('code') code: string,
    @Body() payload: CreateArticleDto,
  ) {
    return this.articleService.addArticleLanguage(payload, {
      languageCode,
      code,
    });
  }

  @Patch('/:code')
  patchArticle(
    @Param('code') code: string,
    @Param('language') languageCode: string,
    @Body() payload: PatchArticleDto,
  ) {
    return this.articleService.patchArticle(payload, { languageCode, code });
  }

  @Delete('/:code')
  deleteArticle(@Param('code') code: string) {
    return this.articleService.deleteArticle({ code });
  }
}
