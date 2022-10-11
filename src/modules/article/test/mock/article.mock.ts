import { CreateArticleDto } from '../../article.dtos';

const validArticleMock: CreateArticleDto = {
  name: 'name',
  section: ['section1'],
  categoriesIds: [],
};

export const articleDtoMocks = {
  validArticleMock,
};
