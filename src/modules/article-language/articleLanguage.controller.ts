import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PatchArticleLanguageDto } from './articleLanguage.dtos';
import { ArticleLanguageService } from './articleLanguage.service';

@ApiTags('article-language')
@Controller()
export class ArticleLanguageController {
  constructor(private readonly articleLanguageService: ArticleLanguageService) {}

  @Patch('/:code')
  patchArticleLanguage(@Param('code') code: string, @Body() payload: PatchArticleLanguageDto) {
    return this.articleLanguageService.patchArticleLanguage(payload, { code });
  }

  @Delete('/:code')
  deleteArticleLanguage(@Param('code') code: string) {
    return this.articleLanguageService.deleteArticleLanguage({ code });
  }
}
