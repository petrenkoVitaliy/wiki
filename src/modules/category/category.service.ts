import { Injectable } from '@nestjs/common';

import { CategoryRepository } from '../../repositories/category.repository';
import { notEmptyWithPredicate, pick } from '../../utils/utils';
import { CategoriesTree, CategoryAggregation } from './category.types';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getCategoriesMap(options: { language: string }) {
    const categories = await this.categoryRepository.findMany(options);

    return this.mapToCategoriesTree(categories);
  }

  private mapToCategoriesTree(categories: CategoryAggregation[]): CategoriesTree[] {
    const categoryTreeNodes: CategoriesTree[] = [];

    const categoriesMap = categories.reduce(
      (acc: { [key: number]: CategoriesTree | undefined }, category) => {
        if (category.enabled) {
          const categoryNode = {
            ...pick(category, ['id', 'name', 'description', 'parentId']),

            articles: category.articleCategories.map((articleCategory) => ({
              ...pick(articleCategory.article, ['type', 'code']),
              name: articleCategory.article.articleLanguages[0].name,
            })),

            children: [],
          };

          acc[category.id] = categoryNode;
          categoryTreeNodes.push(categoryNode);
        }

        return acc;
      },
      {},
    );

    for (let i = 0; i < categoryTreeNodes.length; i++) {
      if (!categoryTreeNodes[i].parentId) {
        continue;
      }

      const parentId = categoryTreeNodes[i].parentId;
      const parentCategory = parentId ? categoriesMap[parentId] : null;

      if (!parentCategory) {
        if (categoriesMap[categoryTreeNodes[i].id]) {
          categoriesMap[categoryTreeNodes[i].id] = undefined;
        }

        continue;
      }

      if (!parentCategory.children) {
        parentCategory.children = [];
      }

      parentCategory.children.push(categoryTreeNodes[i]);
    }

    return Object.values(categoriesMap).filter(
      notEmptyWithPredicate((categoryNode) => !categoryNode.parentId),
    );
  }
}
