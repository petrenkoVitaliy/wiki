import { SectionDto } from '../modules/schema/schema.dtos';
import { ContentUpdateGroups, SchemasOnSectionsNested } from '../modules/schema/schema.types';

export class ContentDiffManager {
  static groupSectionsForUpdate(
    schemaCode: string,
    existingSections: SchemasOnSectionsNested[],
    incomingSections: SectionDto[],
  ): ContentUpdateGroups {
    const existingSectionsMap = existingSections.reduce<{
      [sectionCode: string]: SchemasOnSectionsNested;
    }>((acc, schemaSection) => {
      acc[schemaSection.sectionCode] = schemaSection;

      return acc;
    }, {});

    const existingSectionsSet = new Set(
      Object.values(existingSectionsMap).map(
        ({ schemaCode, section: { code, content, name }, order }) => ({
          content,
          name,
          code,
          order,
          schemaCode,
        }),
      ),
    );

    const { toConnect, toCreate, toUpdate } = incomingSections.reduce<{
      toConnect: { code: string; order: number }[];
      toUpdate: { code: string; order: number }[];
      toCreate: { content: string; order: number; name: string }[];
    }>(
      (acc, incomingSection, order) => {
        let equalExistingSection: {
          name: string;
          content: string;
          code: string;
          schemaCode: string;

          order: number;
        } | null = null;

        for (const section of existingSectionsSet) {
          if (
            section.content === incomingSection.content &&
            section.name === incomingSection.name
          ) {
            equalExistingSection = section;

            break;
          }
        }

        if (equalExistingSection) {
          if (equalExistingSection.schemaCode === schemaCode) {
            if (equalExistingSection.order !== order) {
              acc.toUpdate.push({ code: equalExistingSection.code, order });
            }
          } else {
            acc.toConnect.push({ code: equalExistingSection.code, order });
          }

          existingSectionsSet.delete(equalExistingSection);
        } else {
          acc.toCreate.push({
            content: incomingSection.content,
            name: incomingSection.name,
            order,
          });
        }

        return acc;
      },
      { toConnect: [], toCreate: [], toUpdate: [] },
    );

    const toDelete = Array.from(existingSectionsSet).map(({ code }) => ({ code }));

    return {
      toDelete,
      toConnect,
      toCreate,
      toUpdate,
    };
  }
}
