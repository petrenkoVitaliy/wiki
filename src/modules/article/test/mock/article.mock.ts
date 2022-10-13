import { CreateArticleDto } from '../../article.dtos';

const validArticleMock: CreateArticleDto = {
  name: 'name',
  sections: [
    {
      content: 'section1',
      name: 'name1',
    },
  ],
  categoriesIds: [],
};

export const articleDtoMocks = {
  validArticleMock,
};
