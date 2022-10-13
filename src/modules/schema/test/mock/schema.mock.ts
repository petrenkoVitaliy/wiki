import { CreateSchemaDto } from '../../schema.dtos';

const validSchemaMock: CreateSchemaDto = {
  sections: [
    {
      name: 'name1',
      content: 'section1',
    },
  ],
};

export const schemaDtoMocks = {
  validSchemaMock,
};
