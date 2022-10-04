import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSchemaDto } from './schema.dtos';
import { SchemaService } from './schema.service';

@ApiTags('schema')
@Controller()
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get('/:code')
  getSchema(
    @Param('code') code: string,
    @Param('article_version_code') articleVersionCode: string,
    @Param('language') languageCode: string,
  ) {
    return this.schemaService.getSchema({
      code,
      articleVersionCode,
      languageCode,
    });
  }

  @Post('')
  createDraft(
    @Param('article_version_code') articleVersionCode: string,
    @Param('language') languageCode: string,
    @Body() payload: CreateSchemaDto,
  ) {
    return this.schemaService.createDraftSchema(payload, {
      articleVersionCode,
      languageCode,
    });
  }

  @Put('/:code')
  updateDraft(
    @Param('code') code: string,
    @Param('language') languageCode: string,
    @Param('article_version_code') articleVersionCode: string,
    @Body() payload: CreateSchemaDto,
  ) {
    return this.schemaService.updateDraftSchema(payload, {
      code,
      languageCode,
      articleVersionCode,
    });
  }

  @Put('/:code/renovate')
  renovateDraftSchema(
    @Param('code') code: string,
    @Param('language') languageCode: string,
    @Param('article_version_code') articleVersionCode: string,
    @Body() payload: CreateSchemaDto,
  ) {
    return this.schemaService.renovateDraftSchema(payload, {
      code,
      languageCode,
      articleVersionCode,
    });
  }

  @Post('/:code/approve')
  approveDraft(
    @Param('article_version_code') articleVersionCode: string,
    @Param('code') code: string,
    @Param('language') languageCode: string,
  ) {
    return this.schemaService.approveDraft({
      articleVersionCode,
      languageCode,
      code,
    });
  }
}
