import { CreateArticleDto } from '../../article.dtos';

const validArticleMock: CreateArticleDto = {
  name: 'name',
  body: 'body',
  header: 'header',
  categoriesIds: [],
};

export const articleDTOMocks = {
  validArticleMock,
};
