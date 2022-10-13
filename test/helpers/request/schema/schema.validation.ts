import { MappedSchema } from '../../../../src/modules/article/article.types';
import { CreateSchemaDto } from '../../../../src/modules/schema/schema.dtos';

const getSchema = (
  body: unknown,
  options: {
    shouldBeRenovated: boolean;
    parentSchema: {
      sections: { content: string; name: string }[];
    };
    schema: {
      sections: { content: string; name: string }[];
    };
  },
) => {
  expect(body).toMatchObject({
    shouldBeRenovated: options.shouldBeRenovated,
    parentSchema: {
      sections: options.parentSchema.sections,
    },
    sections: options.schema.sections,
  });
};

const createDraft = (
  body: unknown,
  options: {
    basicSchema: MappedSchema;
    schemaDto: CreateSchemaDto;
  },
) => {
  expect(body).toMatchObject({
    shouldBeRenovated: false,
    parentSchema: {
      sections: options.basicSchema.sections,
    },
    sections: options.schemaDto.sections,
  });
};

const updateDraft = (
  body: unknown,
  options: {
    schemaDto: CreateSchemaDto;
    shouldBeRenovated: boolean;
    parentSchema: {
      sections: { content: string; name: string }[];
    };
  },
) => {
  expect(body).toMatchObject({
    shouldBeRenovated: options.shouldBeRenovated,
    parentSchema: {
      sections: options.parentSchema.sections,
    },
    sections: options.schemaDto.sections,
  });
};

const approveDraft = (
  body: unknown,
  options: {
    version: number;
    schemaDto: {
      sections: { name: string; content: string }[];
    };
  },
) => {
  expect(body).toMatchObject({
    version: options.version,
    schema: {
      sections: options.schemaDto.sections,
    },
  });
};

const renovateDraftSchema = (
  body: unknown,
  options: {
    shouldBeRenovated: boolean;
    parentSchema: {
      sections: { content: string; name: string }[];
    };
    schemaDto: CreateSchemaDto;
  },
) => {
  expect(body).toMatchObject({
    shouldBeRenovated: options.shouldBeRenovated,
    parentSchema: {
      sections: options.parentSchema.sections,
    },
    sections: options.schemaDto.sections,
  });
};

export const schemaValidations = {
  getSchema,
  createDraft,
  updateDraft,
  approveDraft,
  renovateDraftSchema,
};
