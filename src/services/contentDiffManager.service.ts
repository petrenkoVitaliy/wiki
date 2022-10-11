import { Section } from '@prisma/client';
import { ContentUpdateGroups } from '../modules/schema/schema.types';

export class ContentDiffManager {
  static groupSectionsForUpdate(
    existingSections: Section[],
    incomingSections: string[],
  ): ContentUpdateGroups {
    const existingSectionsSet = new Set(
      existingSections.map(({ content, code }) => ({ content, code })),
    );

    const { toConnect, toCreate } = incomingSections.reduce<{
      toConnect: { code: string }[];
      toCreate: { content: string }[];
    }>(
      (acc, content) => {
        let equalExistingSection: {
          content: string;
          code: string;
        } | null = null;

        for (const section of existingSectionsSet) {
          if (section.content === content) {
            equalExistingSection = section;

            break;
          }
        }

        if (equalExistingSection) {
          acc.toConnect.push({ code: equalExistingSection.code });

          existingSectionsSet.delete(equalExistingSection);
        } else {
          acc.toCreate.push({ content });
        }

        return acc;
      },
      { toConnect: [], toCreate: [] },
    );

    const toDelete = Array.from(existingSectionsSet).map(({ code }) => ({ code }));

    return {
      toDelete,
      toConnect,
      toCreate,
    };
  }
}
