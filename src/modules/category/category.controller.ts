import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CategoriesTree } from './category.types';

@ApiTags('category')
@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategoriesMap(
    @Param('language') language: string,
  ): Promise<CategoriesTree[]> {
    return this.categoryService.getCategoriesMap({ language });
  }
}
